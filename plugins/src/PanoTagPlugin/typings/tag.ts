import type { Five } from '@realsee/five'
import type { Create3DDomContainerParamsType } from '../../CSS3DRenderPlugin/Controller'
export type { PartialDeep } from 'type-fest'

export type TagId = string | number

export type ArrayPosition = [number, number, number]

export type Position = ArrayPosition

type Object = Record<string | number | symbol, any>

/** 返回一个销毁函数 */
type ElementRenderer = (container: HTMLElement) => () => void

interface MinMax {
  min?: number
  max?: number
}

export enum DimensionType {
  Two = '2D',
  Three = '3D',
}

export enum PointType {
  PointTag = 'PointTag',
  PlaneTag = 'PlaneTag',
}

export enum ContentType {
  /** 音频标签 */
  Audio = 'Audio',
  /** 文本标签 */
  Text = 'Text',
  /** 图文标签 */
  ImageText = 'ImageText',
  /** VR跳转标签 */
  Link = 'Link',
  /** 营销标签 */
  Marketing = 'Marketing',
  /** 图片视频贴片 */
  MediaPlane = 'MediaPlane',
  /** 其他/自定义标签 */
  Custom = 'Custom',
}

export interface Tags {
  version?: string
  /** tag配置 > 按type配置 > 全局配置 */
  /** 全局配置 */
  globalConfig?: TagConfig
  /** 按type配置 */
  contentTypeConfig?: Partial<Record<ContentTypeConfigKey, TagConfig>>
  tagList: Tag[]
}

export type ContentTypeConfigKeyArray = [DimensionType | 'Any', ContentType | 'Any', PointType | 'Any']

export type ContentTypeConfigKey = `${ContentTypeConfigKeyArray[0]}-${ContentTypeConfigKeyArray[1]}-${ContentTypeConfigKeyArray[2]}`

export type Tag<
  C extends ContentType = any,
  P extends PointType = any,
  D extends DimensionType = any,
  CustomDataType extends Object = {},
> = {
  /** 开启/禁用 */
  enabled?: boolean
  /** 唯一标识 */
  id: TagId
  /** 一个点的标签/4个点的标签 */
  pointType: P
  /** 2维/3维类型 */
  dimensionType: D
  /** 内容类型，根据内容类型展示对应UI */
  contentType: C
  /** 点 */
  position: P extends PointType.PointTag ? Position : P extends PointType.PlaneTag ? [Position, Position, Position, Position] : any
  /** 自定义标签内容 */
  element?: string | Element | ElementRenderer
  /** 标签数据 */
  data: C extends ContentType.Custom ? CustomDataType : ContentTypeMap[C]
  /** 「展开/收起」 「可见/不可见」 的策略配置 */
  config?: TagConfig<C, P, D, CustomDataType>
  /** 法向量 */
  normal?: Position
  /** 样式 */
  style?: {
    /** 小圆点样式 */
    point?: { style: 'Default' } | { style: 'CustomIcon'; iconUrl: string } | { style: 'noPoint' }
    /** 收起的时候的动画延时，单位：ms */
    foldedPointDelay?: number
  }
} & (D extends DimensionType.Three ? (P extends PointType.PointTag ? { normal: Position } : unknown) : unknown) /** 三维标签需要法向量 */

export interface TagConfig<
  C extends ContentType = ContentType,
  T extends PointType = PointType,
  D extends DimensionType = DimensionType,
  CustomDataType extends Object = {},
> {
  /** 显示/隐藏配置 */
  visibleConfig?:
    | {
        /** 保持可见/不可见, 设置后visibleConfig下所有其他配置都不生效 */
        keep?: 'visible' | 'hidden'
        /** 走点时不隐藏 */
        alwaysShowWhenMovePano?: true
        /** min-max米内显示 | 无距离限制 */
        visibleDistance?: MinMax | 'unLimited'
        /** 限制xx点位上可见，不传则不限制 */
        visiblePanoIndex?: number[]
        /** 碰撞检测配置 */
        intersectRaycaster?: {
          /** 是否开启碰撞检测 */
          enabled?: false
          /** 碰撞检测的允许误差, 默认值建议为0.01 */
          distanceAccuracy?: number
        }
        /** 3D标签中 「标签所在平面或垂直于标签法线的平面」 与 「摄像机到标签点或中心点的向量」 的夹角，范围内自动展开，范围外自动收起 */
        angleRange?: MinMax
      }
    | ((
        five: Five,
        tagState: {
          tag: Tag<C, T, D, CustomDataType>
          /** 标签点或中心点的到摄像机的距离 */
          distance: number
          /** 3D标签中 「标签所在平面或垂直于标签法线的平面」 与 「摄像机到标签点或中心点的向量」 的夹角 */
          angleRange?: number
        },
      ) => boolean)
  /** 展开/收起配置 */
  unfoldedConfig?:
    | {
        /** 保持展开/收起，设置后unfoldedConfig下所有其他配置都不生效 */
        keep?: 'unfolded' | 'folded'
        /** 划动到不可见状态时，自动收起，disableFold: true 的标签不受此参数影响 */
        autoUnfoldWhenHide?: false
        /**
         * @deprecated replace by { keep: 'folded' }
         * @deprecated 部分标签是无法打开的
         */
        disableUnfold?: true
        /**
         * @deprecated replace by { keep: 'unfolded' }
         * @deprecated 部分标签是无法收起的
         */
        disableFold?: true
        /** min-max米内自动展开,否则收起 */
        unfoldDistance?: MinMax
        /** 自动展开策略 */
        autoUnfold?:
          | {
              /** 自动展开 策略 */
              strategy?: 'ScreenPostion'
              /** 自动展开策略，{min,max}为project(camera)后的x值 */
              autoUnfoldProjectX?: MinMax
            }
          | {
              /** 自动展开 策略 */
              strategy?: 'MinimumDistance'
              /** 展开的最大数量, 默认为1 */
              maxNumber?: number
            }
      }
    | ((
        five: Five,
        tagState: {
          tag: Tag<C, T, D, CustomDataType>
          /** 标签点或中心点的到摄像机的距离 */
          distance: number
          /** 3D标签中 「标签所在平面或垂直于标签法线的平面」 与 「摄像机到标签点或中心点的向量」 的夹角 */
          angleRange?: number
        },
      ) => boolean)
  /** 初始状态 */
  initialState?: {
    /** 显示/隐藏 */
    visible?: boolean
    /** 展开/收起 */
    unfolded?: boolean
  }
  tag3DConfig?: Create3DDomContainerParamsType['config']
  clickable?: false
}

export enum LinkType {
  VrLink = 'vr', // VR
  NormalLink = 'normal', // 外部链接
}

export type MediaData = { type: 'Image'; url: string } | { type: 'Video'; url: string; videoCoverUrl?: string }
export type ObjectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'

export interface ContentTypeMap {
  [ContentType.Audio]: {
    text: string
    audioUrl: string
    extraData?: Object
  }
  [ContentType.ImageText]: {
    text?: string
    mediaData: (MediaData & { name?: string })[]
    extraData?: Object
  }
  [ContentType.Text]: {
    text: string
    extraData?: Object
  }
  [ContentType.Link]: {
    // imageUrl?: string
    linkType: LinkType
    text: string
    extraData?: Object
  }
  [ContentType.Marketing]: {
    /** 标题 */
    title: string
    /** 高亮的标签 */
    brandTags?: string[]
    /** 普通标签 */
    tags?: string[]
    /** 头部宣传图 */
    headerPictureUrl?: string
    /** 跳转文字 */
    highlightText?: string
    /** 价格 */
    price?: {
      value: string
      /** 单位 */
      unit: string
    }
    extraData?: Object
  }
  [ContentType.MediaPlane]: {
    enableCarousel?: boolean // 是否开启轮播，默认为true
    /**
     * @description stretch: 拉伸适配, proportional: 等比适配，默认值 'proportional'
     * @deprecated replaced by objectFit
     */
    adaptationMode?: 'stretch' | 'proportional'
    /** object-fit doc {@link https://developer.mozilla.org/zh-CN/docs/Web/CSS/object-fit} */
    objectFit?: ObjectFit
    /**
     * @description 是否开启自动轮播
     * @param autoplay true: 开启自动轮播, false: 关闭自动播放
     * @param autoplayVideo 自动轮播时，如果是视频， 则自动播放视频
     * @default 默认值 { autoplay: true, autoplayVideo: false }
     */
    autoplayConfig?: { autoplay: boolean; autoplayVideo: boolean }
    mediaData: MediaData[]
    extraData?: Object
  }
  [ContentType.Custom]: unknown
}

/** 内置一些基础标签 */
/** 一个点的标签 */
export type PointTag<
  C extends ContentType = ContentType,
  D extends DimensionType = DimensionType,
  CustomDataType extends Object = {},
> = Tag<C, PointType.PointTag, D, CustomDataType>

/** 二维标签 */
export type Tag2D<C extends ContentType = ContentType, CustomDataType extends Object = {}> = Tag<
  C,
  PointType.PointTag,
  DimensionType.Two,
  CustomDataType
>

/** 三维标签 */
export type Tag3D<C extends ContentType = ContentType, CustomDataType extends Object = {}> = Tag<
  C,
  PointType.PointTag,
  DimensionType.Three,
  CustomDataType
>

/** 三维贴片 */
export type PlaneTag<C extends ContentType = ContentType, CustomDataType extends Object = {}> = Tag<
  C,
  PointType.PlaneTag,
  DimensionType.Three,
  CustomDataType
>
