import type { PartialDeep } from 'type-fest'
import { Five, FivePlugin, Camera, Model } from '@realsee/five'
import * as THREE from 'three'

export interface Config {
  lookAtCurrentCamera: boolean
  lockedPanoIndex: number | null
  lockedLatitude: number | null
  lockedLongitude: number | null
}

export interface ModelViewPluginExportType {
  enable: () => void

  disable: () => void

  getCurrentState: () => { enabled: boolean }

  appendTo: (element: HTMLElement, size?: { width?: number; height?: number }) => void

  refresh: (size?: { width?: number; height?: number }) => void

  changeConfigs: (config: Partial<Config>) => void
}

export interface ModelViewPluginParameterType {
  config: Config
  initialState: { enabled: boolean }
}

/**
 * Five 模型插件
 * @template ExportType 导出方法
 */
export const ModelViewPlugin: FivePlugin<PartialDeep<ModelViewPluginParameterType> | undefined, ModelViewPluginExportType> = (
  five: Five,
  params,
) => {
  let enabled = params?.initialState?.enabled ?? true
  let hasModelLoaded = false
  let needsRender = true
  let renderer: THREE.WebGLRenderer | null = null

  const defaultConfig: Config = {
    lookAtCurrentCamera: false,
    lockedPanoIndex: null,
    lockedLatitude: null,
    lockedLongitude: null,
  }

  const config: Config = { ...defaultConfig, ...params?.config }

  const scene = new THREE.Scene()
  const camera = new Camera(60)

  let model = new THREE.Object3D()
  let distance: number | undefined
  let offset: THREE.Vector3 | undefined

  {
    const light = new THREE.DirectionalLight(0xffffff, 0.5)
    light.position.copy(new THREE.Vector3(1, 1, 1))
    scene.add(light)
  }
  {
    const light = new THREE.DirectionalLight(0xffffff, 0.3)
    scene.add(light)
  }
  {
    const light = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(light)
  }

  scene.add(model)

  const loadModel = () => {
    if (hasModelLoaded) return
    distance = getDistanceFromModel(five.model, camera.fov, camera.aspect)
    offset = five.model.bounding.getCenter(new THREE.Vector3())
    scene.remove(model)
    model = cloneModel(five.model)
    scene.add(model)
    hasModelLoaded = true
    update()
    function cloneMaterial(_material: THREE.ShaderMaterial) {
      const material = _material.clone()
      material.uniforms.modelAlpha.value = 1
      if (material.uniforms.map.value) {
        material.uniforms.map.value.needsUpdate = true
      }
      return material
    }

    function cloneModel(model: THREE.Object3D) {
      if (model instanceof THREE.Mesh) {
        const geometry = model.geometry
        const material = Array.isArray(model.material) ? model.material.map(cloneMaterial) : cloneMaterial(model.material)
        return new THREE.Mesh(geometry, material)
      } else if (model instanceof THREE.Group) {
        const group = new THREE.Group()
        model.children.forEach((object) => group.add(cloneModel(object)))
        return group
      } else {
        const object3D = new THREE.Object3D()
        model.children.forEach((object) => object3D.add(cloneModel(object)))
        return object3D
      }
    }
  }

  const initRendererIfNeeds = () => {
    if (!five.renderer) return
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
      renderer.setPixelRatio(five.renderer.getPixelRatio())
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.setClearColor(0x181a1c, 0)
      renderer.autoClear = true
    }
    return renderer
  }

  const handleModelWillLoad = () => {
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const materials = ([] as THREE.Material[]).concat(object.material)
        materials.forEach((material) => material.dispose())
      }
    })
    scene.remove(model)
    model = new THREE.Object3D()
    scene.add(model)
    hasModelLoaded = false
    update()
  }

  const handleModelLoaded = () => {
    if (!enabled) return
    if (hasModelLoaded) return
    loadModel()
  }

  const enable = () => {
    if (enabled) return

    enabled = true
    scene.add(model)

    if (!hasModelLoaded && five.model.loaded) {
      loadModel()
    }

    update()
  }

  const disable = () => {
    if (!enabled) return

    scene.remove(model)
    needsRender = true
    render()

    enabled = false
  }

  const appendTo = (element: HTMLElement, size: { width?: number; height?: number } = {}) => {
    const renderer = initRendererIfNeeds()
    if (!renderer) return
    element.appendChild(renderer.domElement)
    refresh(size)
    const positionType = window.getComputedStyle(element).position
    if (positionType !== 'relative' && positionType !== 'absolute' && positionType !== 'fixed' && positionType !== 'sticky')
      element.style.position = 'relative'
  }

  const refresh = (size: { width?: number; height?: number } = {}) => {
    if (!renderer) return
    const element = renderer.domElement
    const container = element.parentNode as HTMLElement
    if (container?.nodeName) {
      const { width = container.offsetWidth, height = container.offsetHeight } = size
      renderer.setSize(width, height)
      // 修改摄像机 aspect 比值
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    update()
  }

  function getDistanceFromModel(model: Model, fov: number, aspect: number): number {
    const bounding = model.bounding

    const radius = Math.pow(
      Math.pow(bounding.max.x - bounding.min.x + 1, 2) +
        Math.pow(bounding.max.y - bounding.min.y + 1, 2) +
        Math.pow(bounding.max.z - bounding.min.z + 1, 2),
      1 / 2,
    )

    // fit screen
    let distance = radius / 2 / Math.tan((Math.PI * fov) / 360)
    if (aspect < 1) distance = distance / aspect

    return isNaN(distance) ? radius : distance
  }

  function getOffsetFromPanoIndex(panoIndex: number): THREE.Vector3 {
    return five.work.observers[panoIndex].standingPosition.clone()
  }

  const update = () => {
    if (!enabled) return
    if (!distance || !offset) return
    const pose = five.getPose()
    pose.fov = camera.fov
    pose.offset = offset
    pose.distance = distance
    if (typeof config.lockedLatitude === 'number') pose.latitude = config.lockedLatitude
    if (typeof config.lockedLongitude === 'number') pose.longitude = config.lockedLongitude
    if (typeof config.lockedPanoIndex === 'number') pose.offset = getOffsetFromPanoIndex(config.lockedPanoIndex)
    if (config.lookAtCurrentCamera) pose.offset = five.camera.position.clone().setY(five.camera.position.y + 1)
    camera.setFromPose(pose)
    needsRender = true
  }

  const render = () => {
    if (!enabled) return
    if (needsRender !== true) return
    if (!renderer) return
    if (!renderer.domElement.parentNode) return
    const parentNode = renderer.domElement.parentNode as HTMLElement
    if (parentNode.offsetWidth === 0) return
    renderer.render(scene, camera)
    needsRender = false
  }

  const dispose = () => {
    if (renderer) renderer.dispose()
    renderer = null
  }

  const changeConfigs = (userConfig: Partial<Config>) => {
    Object.assign(config, userConfig)
    update()
  }

  const getCurrentState = () => ({
    enabled,
  })

  Object.assign(window, { camera })

  five.on('modelLoaded', handleModelLoaded)
  five.on('modelWillLoad', handleModelWillLoad)
  five.on('cameraDirectionUpdate', update)
  five.on('dispose', dispose)
  five.on('renderFrame', render)
  five.on('cameraPositionUpdate', update)

  return { appendTo, refresh, changeConfigs, enable, disable, getCurrentState }
}

export default ModelViewPlugin
