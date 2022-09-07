import * as THREE from 'three'

export function getArrowMaterial(params?: { textureUtl?: string }) {
  const texture = new THREE.TextureLoader().load(params?.textureUtl ?? '//vrlab-static.ljcdn.com/release/web/arrow3.06c5b657.png')
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.encoding = THREE.sRGBEncoding
  const arrowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
    transparent: true,
    opacity: 0.8,
  })
  return arrowMaterial
}
