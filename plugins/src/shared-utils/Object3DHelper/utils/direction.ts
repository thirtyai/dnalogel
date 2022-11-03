import type { Direction } from '../typings'
import * as THREE from 'three'

export class DirectionGroup extends THREE.Group {
  public direction: Direction

  public constructor(direction?: Direction) {
    super()
    this.direction = direction || 'x'
  }
}

export class DirectionLine<T extends THREE.Geometry, K extends THREE.Material> extends THREE.Line<T, K> {
  public direction: Direction

  public constructor(geometry?: T, material?: K, direction?: Direction) {
    super(geometry, material)
    this.direction = direction || 'x'
  }
}

export class DirectionMesh<T extends THREE.Geometry, K extends THREE.Material> extends THREE.Mesh<T, K> {
  public direction: Direction

  public constructor(geometry?: T, material?: K, direction?: Direction) {
    super(geometry, material)
    this.direction = direction || 'x'
  }
}
