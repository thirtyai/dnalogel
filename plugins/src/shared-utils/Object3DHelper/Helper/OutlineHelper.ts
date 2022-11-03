import * as THREE from 'three'

const _vector = new THREE.Vector3()

export class OutlineHelper extends THREE.Group {
  public box: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>
  public outline: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>
  private originObject: THREE.Object3D
  private positionAttribute: THREE.BufferAttribute

  public constructor(obj: THREE.Object3D) {
    super()

    this.originObject = obj
    this.positionAttribute = new THREE.BufferAttribute(new Float32Array(8 * 3), 3)
    this.box = this.createBox()
    this.outline = this.createOutline()

    this.add(this.box, this.outline)
    this.update()
  }

  private update() {
    /*
			5____4
		1/___0/|
		| 6__|_7
		2/___3/

		0: max.x, max.y, max.z
		1: min.x, max.y, max.z
		2: min.x, min.y, max.z
		3: max.x, min.y, max.z
		4: max.x, max.y, min.z
		5: min.x, max.y, min.z
		6: min.x, min.y, min.z
		7: max.x, min.y, min.z
		*/
    const box3 = new THREE.Box3()

    if (this.originObject !== undefined) {
      this.originObject.updateMatrixWorld(false)
      this.originObject.traverse((object: any) => {
        if (object.name === 'shadow') return
        const geometry = object.geometry

        if (geometry !== undefined) {
          if (geometry?.attributes?.position) {
            // BufferGeometry
            const position = geometry.attributes.position
            for (let i = 0, l = position.count; i < l; i++) {
              _vector.fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld)
              box3.expandByPoint(_vector)
            }
          } else {
            // Geometry
            geometry.vertices.forEach((v: THREE.Vector3) => {
              const point = v.clone().applyMatrix4(object.matrixWorld)
              box3.expandByPoint(point)
            })
          }
        }
      })
    }
    if (box3.isEmpty()) return

    const objectPosition = this.originObject.position
    box3.translate(objectPosition.clone().negate())

    const min = box3.min
    const max = box3.max

    const position = this.positionAttribute

    position.setXYZ(0, max.x, max.y, max.z)
    position.setXYZ(1, min.x, max.y, max.z)
    position.setXYZ(2, min.x, min.y, max.z)
    position.setXYZ(3, max.x, min.y, max.z)
    position.setXYZ(4, max.x, max.y, min.z)
    position.setXYZ(5, min.x, max.y, min.z)
    position.setXYZ(6, min.x, min.y, min.z)
    position.setXYZ(7, max.x, min.y, min.z)

    position.needsUpdate = true
  }

  private createOutline() {
    const lineIndices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7])
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setIndex(new THREE.BufferAttribute(lineIndices, 1))
    lineGeometry.setAttribute('position', this.positionAttribute)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00fcff,
      linewidth: 1,
      opacity: 1,
      depthTest: false,
      transparent: true,
      toneMapped: false,
    })
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial)
    lineSegments.matrixAutoUpdate = false
    return lineSegments
  }

  private createBox() {
    const boxIndices = new Uint16Array([
      0, 1, 2, 0, 2, 3, 0, 3, 7, 0, 7, 4, 0, 4, 5, 0, 5, 1, 6, 1, 5, 6, 2, 1, 6, 5, 4, 6, 4, 7, 6, 3, 2, 6, 7, 3,
    ])
    const boxGeometry = new THREE.BufferGeometry()
    boxGeometry.setIndex(new THREE.BufferAttribute(boxIndices, 1))
    boxGeometry.setAttribute('position', this.positionAttribute)
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0x00fcff,
      opacity: 0.1,
      depthTest: false,
      transparent: true,
    })
    const box = new THREE.Mesh(boxGeometry, boxMaterial)
    return box
  }
}
