<script lang="ts">
  import classnames from 'classnames'
  import type { LabelItemProp } from './typings'

  export let props: LabelItemProp
  export let onClick: () => void

  let divElement
  let { left, top, inSight, transform, panoIndex, cameraToward, name } = props
  let prevPanoIndexRef = 0
  const initPanoIndex = () => {
    if (!left || !top || !inSight) {
      return
    }
    if (!divElement) return
    const _width = (divElement.current.clientWidth / window.innerWidth) * 100
    const _height = (divElement.current.clientHeight / window.innerHeight) * 100
    if (left! <= _width / 2 || left! >= 100 - _width / 2) {
      return
    }
    if (top! <= _height / 2 || top! >= 100 - _height / 2) {
      return
    }
    const prevPanoIndex = prevPanoIndexRef
    if (panoIndex !== prevPanoIndex) {
      // 触发埋点
      console.log('panoDoorLabelPlugin', panoIndex, '触发埋点')
      // 这里触发曝光埋点
      prevPanoIndexRef = panoIndex
    }
  }

  $: {
    initPanoIndex()
  }
</script>

<template>
  <div
    bind:this="{divElement}"
    style="{`left: ${left || 0}%;top: ${top || 0}%;opacity: ${inSight ? 1 : 0}`}"
    class="plugin-DoorLabelPlugin-item"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="{classnames('plugin-DoorLabelPlugin-cnt', props.toward)}"
      style="{`transform: ${transform || 'initial'};pointer-events: ${
        inSight ? 'auto' : 'none'
      };opacity: ${inSight ? 1 : 0}`}"
      data-camera-toward="{cameraToward}"
      on:click="{(e) => {
        if (onClick) onClick()
      }}"
    >
      <span class="plugin-DoorLabelPlugin-txt">{name}</span>
      <i class="plugin-DoorLabelPlugin-icon"></i>
    </div>
  </div>
</template>

<style lang="scss">
  .plugin-DoorLabelPlugin-item {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .plugin-DoorLabelPlugin-cnt {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.35);
    line-height: 12px;
    padding: 6px;
    white-space: nowrap;
    font-size: 12px;
    font-style: normal;
    // pointer-events: auto;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform ease 1s, background ease 0.3s, color ease 0.3s;
    &::after {
      content: '';
      display: block;
      position: absolute;
      top: -1px;
      left: -1px;
      bottom: -1px;
      right: -1px;
      border-radius: 2px;
      border: 1px solid rgba(0, 0, 0, 0);
      border-image: url('//vrlab-image4.ljcdn.com/release/web/highlightCarouseal-border-image.14b51834.png')
        4;
      transition: opacity ease 0.3s;
    }
    &:active,
    &:focus {
      background: rgba(0, 0, 0, 0.5);
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .plugin-DoorLabelPlugin-icon {
    background: url('//vrlab-image4.ljcdn.com/release/web/DoorLabel-icon.de1304ae.svg') no-repeat;
    background-size: 100%;
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-left: 4px;
    transform-origin: center;
  }

  .plugin-DoorLabelPlugin-cnt[data-camera-toward='forward'] {
    &.left {
      .plugin-DoorLabelPlugin-icon {
        transform: rotate(90deg);
      }
    }
    &.right {
      .plugin-DoorLabelPlugin-txt {
        order: 1;
      }
      .plugin-DoorLabelPlugin-icon {
        transform: rotate(-90deg);
        margin-left: 0;
        margin-right: 4px;
        order: 0;
      }
    }
  }
  .plugin-DoorLabelPlugin-cnt[data-camera-toward='right'] {
    &.forward {
      .plugin-DoorLabelPlugin-icon {
        transform: rotate(90deg);
      }
    }
    &.back {
      .plugin-DoorLabelPlugin-txt {
        order: 1;
      }
      .plugin-DoorLabelPlugin-icon {
        transform: rotate(-90deg);
        margin-left: 0;
        margin-right: 4px;
        order: 0;
      }
    }
  }
  .plugin-DoorLabelPlugin-cnt[data-camera-toward='left'] {
    &.back {
      .plugin-DoorLabelPlugin-icon {
        transform: rotate(90deg);
      }
    }
    &.forward {
      .plugin-DoorLabelPlugin-txt {
        order: 1;
      }
      .plugin-DoorLabelPlugin-icon {
        transform: rotate(-90deg);
        margin-left: 0;
        margin-right: 4px;
        order: 0;
      }
    }
  }
  .plugin-DoorLabelPlugin-cnt[data-camera-toward='back'] {
    &.right {
      .plugin-DoorLabelPlugin-icon {
        transform: rotate(90deg);
      }
    }
    &.left {
      .plugin-DoorLabelPlugin-txt {
        order: 1;
      }
      .plugin-DoorLabelPlugin-icon {
        transform: rotate(-90deg);
        margin-left: 0;
        margin-right: 4px;
        order: 0;
      }
    }
  }

  .plugin-DoorLabelPlugin-cnt--customBrand {
    color: #f9eac1;
    .plugin-DoorLabelPlugin-icon {
      background: url('//vrlab-image4.ljcdn.com/release/web/arrow.6e8ec00e.svg') no-repeat;
    }
    &:active,
    &:focus {
      background: rgba(0, 0, 0, 0.5);
      color: rgba(249, 234, 193, 0.5);
    }
  }
</style>
