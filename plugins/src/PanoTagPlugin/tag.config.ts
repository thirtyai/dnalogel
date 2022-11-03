import type { Tags } from './typings'

const DefaultConfig: {
  globalConfig?: Tags['globalConfig']
  contentTypeConfig?: Tags['contentTypeConfig']
} = {
  globalConfig: {
    initialState: {
      // unfolded: false,
    },
    visibleConfig: {
      visibleDistance: { max: 5 },
      angleRange: { min: -45, max: 45 },
    },
    unfoldedConfig: {
      autoUnfold: {
        strategy: 'MinimumDistance',
      },
    },
    tag3DConfig: {
      ratio: 0.0035,
    },
  },
  contentTypeConfig: {
    'Any-Link-Any': {
      unfoldedConfig: {
        // VR 跳转标签没有展开/收起状态
        keep: 'unfolded',
      },
      initialState: {
        unfolded: true,
      },
    },
    'Any-Marketing-Any': {
      unfoldedConfig: undefined,
    },
    '3D-MediaPlane-PlaneTag': {
      unfoldedConfig: {
        keep: 'unfolded',
      },
      visibleConfig: {
        alwaysShowWhenMovePano: true,
        angleRange: undefined,
        visibleDistance: undefined,
      },
      // clickable: false,
    },
  },
}

export { DefaultConfig }
export default DefaultConfig
