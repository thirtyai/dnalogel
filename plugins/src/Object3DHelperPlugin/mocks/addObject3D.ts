import type { Object3D, Scene } from 'three'
import * as THREE from 'three'
import { GLTFLoader } from '@realsee/five/gltf-loader'

export default function addObject3D(item: any, scene: Scene) {
  const modelPosition = new THREE.Vector3(3.8058113175002797, -1.4285810796152072, -4.748098691966687)

  const modelUrl = item.modelUrl
  const gltfLoader = new GLTFLoader()

  return new Promise<Object3D>((res, rej) => {
    gltfLoader.load(modelUrl, function onLoad(gltf) {
      const model = gltf.scene
      model.traverse((obj: any) => {
        if (obj.material) {
          obj.material.envMapIntensity = 0.5
        }
      })
      scene.add(model)
      model.position.copy(modelPosition)
      model.needsRender = true

      res(model)
      // object3DHelper.add(model)
    })
  })
}
