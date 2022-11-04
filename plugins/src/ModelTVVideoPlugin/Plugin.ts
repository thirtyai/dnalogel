import type { FivePlugin, Mode } from '@realsee/five'
import type { ModelTVVideoPluginData, ModelTVVideoPluginExportType, ModelTVVideoPluginParameterType } from './typings'
import * as THREE from 'three'
import { parseModelTVVideoPoints } from './utils/parseData'
import CSS3DRenderPlugin, { Create3DDomContainerReturnType } from '../CSS3DRenderPlugin'

type ModelTVVideoPluginPoints = THREE.Vector3[][]

interface ModelTVVideoPluginState {
  videoMeshes: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[]
  videoTextureEnabled: boolean
  videoSource: string
  rectPoints: ModelTVVideoPluginPoints
  enabled: boolean
  imageTexture?: THREE.Texture
  videoTexture?: THREE.VideoTexture
  videoElement?: HTMLVideoElement
}

export const ModelTVVideoPlugin: FivePlugin<ModelTVVideoPluginParameterType, ModelTVVideoPluginExportType> = (five, { videoElement }) => {
  const state: ModelTVVideoPluginState = {
    videoMeshes: [],
    videoTextureEnabled: false,
    videoSource: '',
    rectPoints: [],
    enabled: false,
    videoElement: videoElement,
  }

  const css3DRenderPlugin = CSS3DRenderPlugin(five)

  const playIconMap = new Map<typeof state['videoMeshes'][number], Create3DDomContainerReturnType>()

  const setMuted = (muted: boolean) => {
    if (state.videoTexture) {
      state.videoTexture.image.muted = muted
    }
  }
  const getMuted = () => {
    if (state.videoTexture) return state.videoTexture.image.muted
    else return true
  }

  const enable = () => {
    if (state.enabled) return
    if (!state.videoTexture) return

    state.enabled = true
    state.videoMeshes = createPanoVideoMeshes()
    state.videoMeshes.forEach((mesh) => five.scene.add(mesh))

    const play = () => {
      if (!state.videoTexture) return

      const timeupdate = () => {
        if (!state.videoTexture) return
        state.videoTexture?.image.removeEventListener('timeupdate', timeupdate)
        state.videoTextureEnabled = true
        state.videoMeshes.forEach((mesh) => {
          if (mesh.material.map !== state.videoTexture) mesh.material.map = state.videoTexture!
        })
        five.needsRender = true
      }
      state.videoTexture.image.addEventListener('timeupdate', timeupdate)
      if (state.videoTexture && state.videoMeshes.length) {
        state.videoTexture.image.play()
        state.videoTexture.image.onplay = () => {
          css3DRenderPlugin.hide()
        }
        state.videoTexture.image.onpause = () => {
          css3DRenderPlugin.show()
        }
        state.videoTexture.image.onclick = () => {
          state.videoTexture.image.muted = false
          state.videoTexture.image.play()
        }
      }
    }

    if (five.model.loaded) play()
    else {
      return five.once('modelLoaded', () => play())
    }
  }

  const disable = () => {
    if (!state.enabled) return
    state.enabled = false
    state.videoMeshes.forEach((mesh) => {
      mesh.geometry.dispose()
      mesh.material.dispose()
      five.scene.remove(mesh)
      if (state.videoTexture) state.videoTexture.image.pause()
    })
    state.videoMeshes = []
    five.needsRender = true
  }

  const createPanoVideoMeshes = () => {
    return state.rectPoints.map((points, index) => {
      const geometry = new THREE.BufferGeometry()
      const segments = 128

      const verticesArray = []
      verticesArray.push(...points[0].toArray())
      for (let i = 1; i < segments; i++) {
        verticesArray.push(
          points[0].x + ((points[1].x - points[0].x) * i) / segments,
          points[0].y + ((points[1].y - points[0].y) * i) / segments,
          points[0].z + ((points[1].z - points[0].z) * i) / segments,
        )
      }
      verticesArray.push(...points[1].toArray())
      verticesArray.push(...points[2].toArray())
      for (let i = 1; i < segments; i++) {
        verticesArray.push(
          points[2].x + ((points[3].x - points[2].x) * i) / segments,
          points[2].y + ((points[3].y - points[2].y) * i) / segments,
          points[2].z + ((points[3].z - points[2].z) * i) / segments,
        )
      }
      verticesArray.push(...points[3].toArray())

      const uvArray = []
      uvArray.push(0, 1)
      for (let i = 1; i < segments; i++) {
        uvArray.push(0, 1 - i / segments)
      }
      uvArray.push(0, 0)
      uvArray.push(1, 0)
      for (let i = 1; i < segments; i++) {
        uvArray.push(1, i / segments)
      }
      uvArray.push(1, 1)

      const indicesArray = []
      for (let i = 0; i < segments; i++) {
        indicesArray.push(i, i + 1, segments * 2 - i, i, segments * 2 - i, segments * 2 + 1 - i)
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verticesArray), 3))
      geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvArray), 2))
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indicesArray), 1))
      const axesHelper = new THREE.AxesHelper(10)
      five.scene.add(axesHelper)
      const material = new THREE.MeshBasicMaterial({
        map: state.videoTextureEnabled ? state.videoTexture : state.imageTexture,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.renderOrder = 1
      mesh.name = `ModelTVVideoPlugin-${index}-${performance.now()}`

      const pointsForCss3DRender = [points[1], points[2], points[3], points[0]] // omg, 顺序竟然不一样

      // create play icon
      const dom3DContainer = css3DRenderPlugin.create3DDomContainer(pointsForCss3DRender)
      if (dom3DContainer?.container) {
        const playIcon = document.createElement('div')
        playIcon.classList.add('play-icon')
        playIcon.style.width = '100%'
        playIcon.style.height = '100%'
        playIcon.style.display = 'flex'
        playIcon.style.justifyContent = 'center'
        playIcon.style.alignItems = 'center'
        playIcon.style.pointerEvents = 'none'
        dom3DContainer.container.appendChild(playIcon)

        const playIconImg = document.createElement('img')
        playIconImg.src = '//vrlab-static.ljcdn.com/release/web/play.2ada5b6f.png'
        playIconImg.style.width = '200px'
        playIconImg.style.pointerEvents = 'auto'
        playIconImg.onclick = () => {
          state.videoTexture.image.muted = false
          state.videoTexture.image.play()
        }
        playIcon.appendChild(playIconImg)
        playIconMap.set(mesh, dom3DContainer)
      }
      return mesh
    })
  }

  const getImageTexture = (source: string) => {
    const texture = new THREE.TextureLoader().load(source)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBFormat
    return texture
  }

  const getVideoTexture = (source: string, video?: HTMLVideoElement): Promise<THREE.VideoTexture & { videoSource: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            const url = window.URL || window.webkitURL
            video = video || document.createElement('video')
            video.crossOrigin = 'anonymous'
            // video.autoplay = true
            video.muted = true
            video.loop = true
            video.playsInline = true
            video.src = url.createObjectURL(xhr.response)
            const texture = new THREE.VideoTexture(video)
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.format = THREE.RGBFormat
            resolve(Object.assign(texture, { videoSource: source }))
          } else {
            reject(new Error('Video download Error: ' + xhr.status))
          }
        }
      }
      xhr.onerror = (error) => reject(error)
      xhr.open('GET', source)
      xhr.responseType = 'blob'
      xhr.send()
    })
  }

  const load = async (data: ModelTVVideoPluginData, videoElement?: HTMLVideoElement) => {
    const { video_src, video_poster_src, points } = data
    state.videoSource = video_src
    // TODO 存疑，先处理多一次遍历 o(2n)
    state.rectPoints = parseModelTVVideoPoints(points).map((items) => items.map(({ x, y, z }) => new THREE.Vector3(x, y, z)))
    state.imageTexture = getImageTexture(video_poster_src)

    if (videoElement) {
      state.videoElement = videoElement
    }

    state.videoTexture = await getVideoTexture(state.videoSource, state.videoElement)

    state.enabled = !!data.enable
    if (state.enabled) enable()
  }

  const fiveWantsTapGesturehandler = (raycaster): false | void => {
    if (!state.enabled) return
    const targetMesh = state.videoMeshes
    if (!targetMesh) return
    const intersectObjects = raycaster.intersectObjects(targetMesh)
    if (intersectObjects.length === 0) return
    if (state.videoTexture) {
      if (!state.videoTexture.image.paused) {
        state.videoTexture.image.pause()
      }
    }
    return false
  }

  const fiveModeChangeHandler = (mode: Mode) => {
    if (mode === 'Floorplan') {
      css3DRenderPlugin.hide()
    } else {
      css3DRenderPlugin.show()
    }
  }

  const fivePanoArrivedhandler = () => {
    if (!state.enabled) return
    const cameraPosition = five.camera.position
    playIconMap.forEach((dom3DContainer, mesh) => {
      const center = dom3DContainer.css3DObject.position.clone()
      const vector = center.clone().sub(cameraPosition).normalize()
      const raycaster = new THREE.Raycaster(cameraPosition, vector)
      const intersection = five.model.intersectRaycaster(raycaster)[0]
      const distance = center.distanceTo(cameraPosition)
      const distanceError = 0.01
      if (intersection && intersection.distance + distanceError < distance) {
        // 不可见
        dom3DContainer.hide()
      } else {
        // 可见
        dom3DContainer.show()
      }
    })
    if (!getMuted()) {
      const visible = state.rectPoints.find((points) => {
        const centerVector = points[0].clone().add(points[1]).add(points[2]).add(points[3]).divideScalar(4)
        return (
          points
            .map((point) => point.clone().add(centerVector).divideScalar(2))
            .filter((vector) => {
              const distance = vector.distanceTo(cameraPosition)
              const raycaster = new THREE.Raycaster(cameraPosition, vector.clone().sub(cameraPosition).normalize())
              const intersection = five.model.intersectRaycaster(raycaster)[0]
              const distanceError = 0.01
              if (intersection && intersection.distance + distanceError < distance) {
                return false
              } else {
                return true
              }
            }).length >= 2
        )
      })
      if (!visible || visible.length === 0) setMuted(true)
    }
  }

  const dispose = () => {
    disable()
    state.videoTexture = undefined
    five.off('modeChange', fiveModeChangeHandler)
    five.off('wantsTapGesture', fiveWantsTapGesturehandler)
    five.off('panoArrived', fivePanoArrivedhandler)
    five.off('renderFrame', () => {
      // console.log('renderFrame', state.videoMeshes)
      state.videoMeshes.forEach((meshes) => {
        if (meshes)
          // @ts-ignore
          meshes.needsRender = true
      })
    })
  }

  five.on('modeChange', fiveModeChangeHandler)

  five.on('wantsTapGesture', fiveWantsTapGesturehandler)

  five.on('panoArrived', fivePanoArrivedhandler)

  five.on('renderFrame', () => {
    // console.log('renderFrame', state.videoMeshes)
    state.videoMeshes.forEach((meshes) => {
      if (meshes)
        // @ts-ignore
        meshes.needsRender = true
    })
  })

  return { enable, disable, load, dispose, state, css3DRenderPlugin }
}

export default ModelTVVideoPlugin
