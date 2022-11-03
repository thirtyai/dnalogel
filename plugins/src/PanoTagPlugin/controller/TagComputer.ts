import type { Five } from '@realsee/five'
import objectAssignDeep from 'object-assign-deep'
import * as THREE from 'three'
import { DefaultConfig } from '../tag.config'
import {
  Tag,
  Tags,
  TagConfig,
  PointType,
  DimensionType,
  ContentTypeConfigKey,
  ContentTypeConfigKeyArray,
  PointTag,
  PlaneTag,
  TagElement,
  Tag2DElement,
  Tag3DElement,
  PlaneTagElement,
  PointTagElement,
  Tag3D,
  TagId,
} from '../typings'
import { planeNormal, anyPositionToVector3, tagPosition, checkRange } from '../utils'
import { arrayPositionToVector3 } from '../utils'
import { TagCacheController } from './TagCacheController'

export abstract class TagComputer extends TagCacheController {
  public tags: TagElement[] = []

  public config: {
    globalConfig?: Tags['globalConfig']
    contentTypeConfig?: Tags['contentTypeConfig']
  } = DefaultConfig

  private raycaster = new THREE.Raycaster()

  protected constructor(five: Five) {
    super(five)
  }

  public getTagById(id: TagId) {
    const tag = this.tags.find((tag) => {
      return tag.id === id
    })

    if (!tag) {
      console.error(`getTagById(): tag is ${tag}, id is ${id}`)
      return undefined
    }
    return tag
  }

  /**
   * @description: 改变配置
   */
  public changeConfig(config: TagComputer['config'], merge = true) {
    if (merge) {
      this.config = objectAssignDeep({}, this.config, config)
    } else {
      this.config = config
    }
    // 配置改变后要清空缓存，重新计算
    this.clearCache()
  }

  /**
   * @description: 改变全局配置
   */
  public changeGlobalConfig(globalConfig: TagComputer['config']['globalConfig'], merge = true) {
    if (merge) {
      this.config.globalConfig = objectAssignDeep({}, this.config.globalConfig, globalConfig)
    } else {
      this.config.globalConfig = globalConfig
    }
    // 配置改变后要清空缓存，重新计算
    this.clearCache()
  }

  /**
   * @description: 改变类型配置
   */
  public changeContentTypeConfig(key: ContentTypeConfigKey, contentTypeConfig: TagConfig, merge = true) {
    if (!this.config.contentTypeConfig) this.config.contentTypeConfig = {}
    if (merge) {
      this.config.contentTypeConfig[key] = objectAssignDeep({}, this.config.contentTypeConfig[key], contentTypeConfig)
    } else {
      this.config.contentTypeConfig[key] = contentTypeConfig
    }
    // 配置改变后要清空缓存，重新计算
    this.clearCache()
  }

  /**
   * @description: 获取是否可见
   */
  public getVisibleByPanoIndex(tag: Tag, panoIndex?: number) {
    const cache = this.getCaches({ panoIndex, id: tag.id })
    const fivePanoIndex = this.five.panoIndex ?? panoIndex
    if (cache.visible !== undefined) return cache.visible
    else {
      const visible = (() => {
        const config = this.getTagConfig(tag).visibleConfig ?? {}
        const distance = this.getDistance(tag)
        if (typeof config === 'function') {
          return config(this.five, { tag, distance })
        } else {
          if (config.keep === 'hidden') return false
          if (config.keep === 'visible') return true
          // console.log(tag.id, '点位检测', tag)
          // 点位检测
          if (config.visiblePanoIndex !== undefined) {
            if (fivePanoIndex === undefined) return false
            if (!config.visiblePanoIndex.includes(fivePanoIndex)) return false
          }
          // console.log(tag.id, '距离检测', tag)
          // 距离检测
          if (config.visibleDistance !== undefined) {
            if (config.visibleDistance !== 'unLimited') {
              const visible = checkRange(distance, config.visibleDistance)
              if (visible === false) return false
            }
          }
          // console.log(tag.id, '碰撞检测', tag)
          // 碰撞检测
          if (config.intersectRaycaster?.enabled !== false) {
            // console.log(tag.id, '进入碰撞检测', tag)
            if (fivePanoIndex === undefined) return false
            const observerPosition = this.five.work.observers[fivePanoIndex]?.position
            if (observerPosition === undefined) throw new Error(`getVisible(): observerPosition is ${observerPosition}`)
            const direction = tagPosition(tag.position).sub(observerPosition).normalize() // 向量相减得到相机到模型的射线
            this.raycaster.set(observerPosition, direction)
            const [intersection] = this.five.model.intersectRaycaster(this.raycaster)
            // console.log(this.five.model.intersectRaycaster(this.raycaster), this.five.model, this.raycaster, this.five.model.loaded)
            const distanceError = config.intersectRaycaster?.distanceAccuracy ?? 0.01 // 标签误差
            if (intersection && intersection.distance + distanceError < distance) return false
          }
          // console.log(tag.id, '角度检测', tag, config.angleRange)
          // 角度检测
          if (config.angleRange && tag.dimensionType === DimensionType.Three) {
            const visible = checkRange(this.getAngle(tag as any), config.angleRange)
            if (visible === false) return false
          }
          // 结束
          // console.log(tag.id, '结束', tag, visible)
          return true
        }
      })()

      cache.visible = visible
      return cache.visible
    }
  }

  /**
   * @description: 获取是否展开
   */
  public getUnfoldedByPanoIndex(tag: Tag, panoIndex?: number) {
    const visible = this.getVisibleByPanoIndex(tag)
    if (!visible) return
    const cache = this.getCaches({ panoIndex, id: tag.id })
    if (cache.unfolded !== undefined) return cache.unfolded
    else {
      const config = this.getTagConfig(tag).unfoldedConfig
      if (!config) return
      const unfolded = (() => {
        const distance = this.getDistance(tag)
        if (typeof config === 'function') {
          return config(this.five, { tag, distance })
        } else {
          if (config.keep === 'folded') return false
          if (config.keep === 'unfolded') return true
          if (config.disableUnfold === true) return false
          if (config.disableFold === true) return true
          // 距离检测
          if (config.unfoldDistance) {
            const unfolded = checkRange(distance, config.unfoldDistance)
            if (unfolded === false) return false
          }
        }
      })()
      cache.unfolded = unfolded
      const unfoldedByCamera = this.getUnfoldedByCamera(tag)
      if (unfoldedByCamera !== undefined) return unfoldedByCamera
      return cache.unfolded
    }
  }

  /**
   * @description: 获取是否展开
   */
  public getUnfoldedByCamera(tag: Tag) {
    const visible = this.getVisibleByPanoIndex(tag)
    if (!visible) return
    const unfolded = (() => {
      const distance = this.getDistance(tag)
      const config = this.getTagConfig(tag).unfoldedConfig
      if (!config) return
      if (typeof config === 'function') {
        return config(this.five, { tag, distance })
      } else {
        if (config.keep === 'folded') return false
        if (config.keep === 'unfolded') return true
        if (config.disableUnfold === true) return false
        if (config.disableFold === true) return true
        if (config.autoUnfold === undefined) return
        // 屏幕位置检测
        if (config.autoUnfold.strategy === 'ScreenPostion') {
          const project = this.getTagProject(tag)
          if (project) {
            const unfolded = checkRange(project.x, config.autoUnfold.autoUnfoldProjectX)
            if (unfolded === false) return false
          }
        }
        // 最近距离检测
        if (config.autoUnfold.strategy === 'MinimumDistance') {
          const pointTag = this.filterPointTag()
          const sameStrategyTags = pointTag
            .filter((t) => this.getVisibleByPanoIndex(t)) // 筛选可见标签
            .filter((t) => {
              const project = this.getTagProject(t as Tag)
              if (!project) return false
              const { x, y, z } = project
              return !(Math.abs(z) > 1 || Math.abs(x) > 1 || Math.abs(y) > 1)
            })
            .filter((t) => {
              const tagConfig = this.getTagConfig(t).unfoldedConfig
              return typeof tagConfig === 'object' && tagConfig.autoUnfold?.strategy === 'MinimumDistance'
            }) // 筛选 MinimumDistance 标签
            .map((t) => ({ id: t.id, distance: this.getDistance(t as Tag) })) // map
            .filter((t) => t.distance !== undefined) // 过滤
            .sort((a, b) => a.distance - b.distance) // 距离排序
          const index = sameStrategyTags.findIndex((t) => t.id === tag.id)
          if (index === -1) return false
          const unfolded = index <= (config.autoUnfold.maxNumber ?? 1) - 1
          if (unfolded === false) return false
        }
        return true
      }
    })()
    return unfolded
  }

  /**
   * @description: 获取距离
   */
  public getDistance(tag: Tag, panoIndex?: number) {
    const fivePanoIndex = this.five.panoIndex ?? panoIndex
    if (fivePanoIndex === undefined) throw new Error(`getDistance(): fivePanoIndex is ${fivePanoIndex}`)
    const cache = this.getCaches({ panoIndex, id: tag.id })
    if (cache.distance !== undefined) return cache.distance
    else {
      const observerPosition = this.five.work?.observers[fivePanoIndex]?.position
      if (observerPosition === undefined) throw new Error(`getDistance(): observerPosition is ${observerPosition}`)
      const position = (() => {
        if (tag.pointType === PointType.PointTag) {
          return arrayPositionToVector3((tag as PointTag)?.position)
        } else {
          return tagPosition(tag.position)
        }
      })()
      const distance = observerPosition.distanceTo(position)
      cache.distance = distance
      return distance
    }
  }

  /**
   * @description: 获取角度
   */
  public getAngle(tag: Tag3D | PlaneTag, panoIndex?: number) {
    const fivePanoIndex = this.five.panoIndex ?? panoIndex
    if (fivePanoIndex === undefined) throw new Error(`getDistance(): fivePanoIndex is ${fivePanoIndex}`)
    const cache = this.getCaches({ panoIndex, id: tag.id })
    if (cache.angle !== undefined) return cache.angle
    else {
      const observerPosition = this.five.work?.observers[fivePanoIndex]?.position
      if (observerPosition === undefined) throw new Error(`getAngleRange(): observerPosition is ${observerPosition}`)
      const normal = (() => {
        if (tag.pointType === PointType.PointTag) return anyPositionToVector3((tag as any).normal)
        else return planeNormal(tag.position)
      })()
      if (!normal) return
      const tagToCameraVector3 = new THREE.Vector3().copy(observerPosition).sub(tagPosition(tag.position)) // 标签点到相机的向量
      const angle = (normal.angleTo(tagToCameraVector3) * 180) / Math.PI
      cache.angle = angle
      return cache.angle
    }
  }

  // TODO: 缓存
  /**
   * @description: 获取merge后的配置
   */
  public getTagConfig(tag: Tag) {
    if (!tag) return this.config.globalConfig ?? {}
    const contentTypeConfig: Tags['contentTypeConfig'] = {}
    if (this.config.contentTypeConfig) {
      Object.keys(this.config.contentTypeConfig).forEach((_key) => {
        const key = _key as ContentTypeConfigKey
        if (contentTypeConfig[key]) return
        const keys = key.split('-') as ContentTypeConfigKeyArray
        const [dimensionTypeInkey = 'Any', contenttypeInKey = 'Any', pointTypeInkey = 'Any'] = keys || []
        if (
          (tag.dimensionType === dimensionTypeInkey || dimensionTypeInkey === 'Any') &&
          (tag.contentType === contenttypeInKey || contenttypeInKey === 'Any') &&
          (tag.pointType === pointTypeInkey || pointTypeInkey === 'Any')
        ) {
          contentTypeConfig[key] = this.config.contentTypeConfig![key] // 加!是因为前面已经 if (this.config.contentTypeConfig) 过了
        }
      })
    }

    // merge config
    const mergeConfig = objectAssignDeep({}, this.config.globalConfig, ...Object.values(contentTypeConfig), tag.config)
    return mergeConfig as TagConfig
  }

  // eslint-disable-next-line complexity
  protected canBe(action: 'show' | 'hide' | 'fold' | 'unfold', tag: Tag): boolean {
    const config = this.getTagConfig(tag)
    if (!config || typeof config !== 'object') return true
    if (action === 'show' || action === 'hide') {
      if (!config.visibleConfig || typeof config.visibleConfig !== 'object') return true
      if (action === 'show') {
        if (config.visibleConfig.keep === 'hidden') return false
      }
      if (action === 'hide') {
        if (config.visibleConfig.keep === 'visible') return false
        if (config.visibleConfig.alwaysShowWhenMovePano) return false
      }
    }
    if (action === 'fold' || action === 'unfold') {
      if (!config.unfoldedConfig || typeof config.unfoldedConfig !== 'object') return true
      if (action === 'fold') {
        if (config.unfoldedConfig.disableFold) return false
        if (config.unfoldedConfig.keep === 'unfolded') return false
      }
      if (action === 'unfold') {
        if (config.unfoldedConfig.disableUnfold) return false
        if (config.unfoldedConfig.keep === 'folded') return false
      }
    }

    return true
  }

  /**
   * @description: 一个点的标签
   */
  protected setPointTagPosition() {
    const tags = this.filterPointTag()
    if (tags.length === 0) return
    tags.forEach((tag) => {
      if (!tag.state?.visible) {
        tag.pointTagStyle = undefined
        return
      }
      const project = this.getTagProject(tag as Tag)
      if (!project) {
        tag.pointTagStyle = undefined
        return
      }
      tag.pointTagStyle = { leftPercent: ((project.x + 1) / 2) * 100, topPercent: ((-project.y + 1) / 2) * 100 }
    })
  }

  protected setVisibleByPanoIndex() {
    this.tags.forEach((tag) => {
      const visible = this.getVisibleByPanoIndex(tag)
      if (tag.state) tag.state.visible = visible
    })
  }

  protected setUnfoldedByPanoIndex() {
    this.tags.forEach((tag) => {
      const unfolded = this.getUnfoldedByPanoIndex(tag)
      if (!tag.state) return
      if (unfolded !== undefined) {
        tag.state.unfolded = unfolded
      }

      // 如果标签展开但不可见，就要判断autoUnfoldWhenHide
      if (unfolded && !tag.state.visible) {
        const config = this.getTagConfig(tag)
        if (typeof config.unfoldedConfig === 'object' && config.unfoldedConfig.autoUnfoldWhenHide !== false) {
          tag.state.unfolded = false
        }
      }
    })
  }

  /**
   * @description: 一个点的标签
   */
  protected getTagProject(tag: Tag) {
    const visible = this.getVisibleByPanoIndex(tag)
    if (!visible) return
    const vector3Position = tagPosition(tag.position)
    const { x, y, z } = vector3Position.project(this.five.camera)
    if (z > 1) return
    return { x, y, z }
  }

  // TODO: 优化点：下面这些函数，调用比较频繁，可以按点位加缓存
  protected filterPointTag(): PointTagElement[] {
    return this.tags.filter((tag) => tag.pointType === PointType.PointTag) as PointTagElement[]
  }

  protected filterTag2D(): Tag2DElement[] {
    return this.tags.filter((tag) => tag.dimensionType === DimensionType.Two) as Tag2DElement[]
  }

  protected filter3DPointTag(): Tag3DElement[] {
    return this.tags.filter((tag) => tag.dimensionType === DimensionType.Three && tag.pointType === PointType.PointTag) as Tag3DElement[]
  }

  protected filter3DTag(): TagElement<any, PointType, DimensionType.Three>[] {
    return this.tags.filter((tag) => tag.dimensionType === DimensionType.Three) as TagElement<any, PointType, DimensionType.Three>[]
  }

  protected filterPlaneTag(): PlaneTagElement[] {
    return this.tags.filter((tag) => tag.dimensionType === DimensionType.Three && tag.pointType === PointType.PlaneTag) as PlaneTagElement[]
  }
}
