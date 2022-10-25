import type * as THREE from 'three'
import { MeshBasicMaterial, MeshBasicMaterialParameters, Object3D } from 'three'

export default function transfromToMeshBasicMaterial(object: Object3D, options?: MeshBasicMaterialParameters) {
  object.traverse((ele) => {
    if (ele.type === 'Mesh') {
      const mesh = ele as THREE.Mesh
      const materialConf = {map: (mesh.material as any).map || {}, ...options}
      mesh.material = new MeshBasicMaterial(materialConf)
      mesh.renderOrder = 1
      if (ele.parent?.type === 'Mesh') {
        ele.renderOrder = ele.parent.renderOrder + 1
      }
    }
  })
}
