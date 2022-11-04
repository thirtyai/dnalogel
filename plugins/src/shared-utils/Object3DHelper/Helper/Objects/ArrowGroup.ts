import * as THREE from 'three'
import type { Direction } from '../../typings'
import { DirectionGroup, DirectionLine, DirectionMesh } from '../../utils'

function createArrowShape(size: number) {
  const shape = new THREE.Shape()
  const width = size / 4
  shape.moveTo(0, size)
  shape.lineTo(-width, size / 2)
  shape.lineTo(-width / 2, size / 2)
  shape.lineTo(-width / 2, 0)
  shape.lineTo(0, 0)
  shape.lineTo(width / 2, 0)
  shape.lineTo(width / 2, size / 2)
  shape.lineTo(width, size / 2)
  shape.lineTo(0, size)
  return shape
}

interface InstanceParameter {
  direction: Direction
  color?: THREE.Color | string | number
}

export class ArrowGroup extends DirectionGroup {
  public line: DirectionMesh<THREE.Geometry, THREE.MeshBasicMaterial>
  public arrow: DirectionMesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>
  private lineHeight = 0.4
  private arrowHeight = 0.1

  public constructor(param: InstanceParameter) {
    super(param.direction)
    this.name = 'ArrowGroup'

    const color = new THREE.Color(param.color ?? 0xf7692b)
    const material = new THREE.MeshBasicMaterial({
      color,
      depthTest: false,
      opacity: 1,
      transparent: true,
      side: THREE.DoubleSide,
    })

    // arrow
    const coneGeometry = new THREE.ConeGeometry(0.04, 0.1, 32)
    const arrow = new DirectionMesh(coneGeometry, material.clone(), param.direction)
    arrow.name = `arrow-${param.direction}`
    this.arrow = arrow

    // line
    const radius = 0.004
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, 0.4, 32)
    const cylinder = new DirectionMesh(cylinderGeometry, material.clone(), param.direction)
    cylinder.name = `line-${param.direction}`
    this.line = cylinder

    this.formatArrow()
    this.formatLine()

    this.add(this.arrow, this.line)
  }

  private formatArrow() {
    this.arrow.geometry.translate(0, this.lineHeight + this.arrowHeight / 2, 0)
    if (this.direction === 'x') {
      this.arrow.geometry.rotateX(Math.PI / 2)
      this.arrow.geometry.rotateY(Math.PI / 2)
    } else if (this.direction === 'z') {
      this.arrow.geometry.rotateX(Math.PI / 2)
    }
  }

  private formatLine() {
    this.line.geometry.translate(0, this.lineHeight / 2, 0)
    if (this.direction === 'x') {
      this.line.geometry.rotateX(Math.PI / 2)
      this.line.geometry.rotateY(Math.PI / 2)
    } else if (this.direction === 'z') {
      this.line.geometry.rotateX(Math.PI / 2)
    }
  }
}
