import * as THREE from 'three'

const AXES_COLOR = {
  X: 0xee5252,
  Y: 0x48b74f,
  Z: 0x4082ff,
}

// const AXES_THREE_COLOR = {
//   X: new THREE.Color(AXES_COLOR.X).convertSRGBToLinear(),
//   Y: new THREE.Color(AXES_COLOR.Y).convertSRGBToLinear(),
//   Z: new THREE.Color(AXES_COLOR.Z).convertSRGBToLinear(),
// }

class AXES_THREE_COLOR {
  public static get X() {
    return new THREE.Color(AXES_COLOR.X).convertSRGBToLinear().clone()
  }
  public static get Y() {
    return new THREE.Color(AXES_COLOR.Y).convertSRGBToLinear().clone()
  }
  public static get Z() {
    return new THREE.Color(AXES_COLOR.Z).convertSRGBToLinear().clone()
  }
}

export { AXES_COLOR, AXES_THREE_COLOR }
