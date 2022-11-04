import * as THREE from 'three'

export function getArrowMaterial(params: { textureUrl: string }) {
  const texture = new THREE.TextureLoader().load(params.textureUrl)

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
