import type { Object3D } from 'three'
import type { CSS3DObjectPlus } from './three/CSS3DObject'

export default function getAllCSS3DObject(...object: Object3D[]) {
  const css3DObjectPlus: CSS3DObjectPlus[] = []
  object.forEach((object) => {
    if ((object as any).isCSS3DObjectPlus) {
      css3DObjectPlus.push(object as CSS3DObjectPlus)
    } else {
      css3DObjectPlus.push(...getAllCSS3DObject(...object.children))
    }
  })
  return css3DObjectPlus
}
