<script lang="ts">
  import { fade } from 'svelte/transition'

  export let inDelay = 1000
  export let outDelay = 1000
  export let visible = true
  export let width: number | string = 0
  export let height: number | string = 0
  export let left: number | string = 0
  export let bottom: number | string = 0
  export let center = false
  export let horizontalCenter = false
  export let verticalCenter = false
  export let blurRadius: number
  export let spreadRadius: number
  export let opacity = 0.15
  // export let zIndex = -1
  // eslint-disable-next-line no-undef-init
  export let zIndex: undefined | number = undefined

  function px2rem(value: string | number) {
    return typeof value === 'number' ? value / 16 + 'rem' : value
  }
</script>

{#if visible}
  <div
    class="shadow"
    style:width={px2rem(width)}
    style:height={px2rem(height)}
    style:z-index={zIndex}
    style={`
      left:${px2rem(left)};
      bottom:${px2rem(bottom)};
      box-shadow: 0 0 ${px2rem(blurRadius)} ${px2rem(spreadRadius)} rgba(0, 0, 0, ${opacity});
      ${horizontalCenter ? 'transform: translateX(-50%); left: 50%' : ''}
      ${verticalCenter ? 'transform: translateX(-50%); top: 50%' : ''}
      ${center ? 'transform: translate(-50%, -50%); left: 50%; top: 50%;' : ''}
    `}
    in:fade|local={{ duration: inDelay }}
    out:fade|local={{ duration: outDelay }}
  />
{/if}

<style>
  .shadow {
    position: absolute;
  }
</style>
