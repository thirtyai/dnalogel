import * as THREE from 'three'

export function getArrowMaterial(params?: { textureUrl?: string }) {
  // const texture = new THREE.TextureLoader().load(params?.textureUrl ?? '//vrlab-static.ljcdn.com/release/web/arrow.c5d028e4.png')
  // const texture = new THREE.TextureLoader().load(params?.textureUrl ?? '//vrlab-static.ljcdn.com/release/web/arrow2.aa1762e4.png')
  // const texture = new THREE.TextureLoader().load(params?.textureUrl ?? '//vrlab-static.ljcdn.com/release/web/arrow3.06c5b657.png')
  // const texture = new THREE.TextureLoader().load(params?.textureUrl ?? '//vrlab-static.ljcdn.com/release/web/arrow4.b1427685.png')
  // const texture = new THREE.TextureLoader().load(params?.textureUrl ?? '//vrlab-static.ljcdn.com/release/web/arrow5.ae49f3c8.png')
  const texture = new THREE.TextureLoader().load(params?.textureUrl ?? '//vrlab-static.ljcdn.com/release/web/arrow6.b6ce0c62.png')

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
