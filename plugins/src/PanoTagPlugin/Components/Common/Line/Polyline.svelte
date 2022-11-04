<script lang="ts">
  import uuid from '../../../../shared-utils/uuid'
  import { draw } from 'svelte/transition'
  import { cubicOut, cubicInOut } from 'svelte/easing'

  export let inDelay = 0
  export let duration = 0
  export let outDelay = 0
  export let unfolded: boolean

  const defsID = uuid()
</script>

<svg class="line" viewBox="0 0 105 21">
  <defs>
    <linearGradient id={defsID} gradientUnits="userSpaceOnUse">
      <stop offset="25%" stop-color="white" stop-opacity="1" />
      <stop offset="100%" stop-color="white" stop-opacity="0.5" />
    </linearGradient>
  </defs>
  {#if unfolded}
    <path
      in:draw|local={{ duration, delay: inDelay, easing: cubicOut }}
      out:draw|local={{ duration, delay: outDelay, easing: cubicInOut }}
      fill="none"
      stroke="url(#{defsID})"
      stroke-width="1"
      d="M0 21 L14 0.5 L105 0.5"
    />
  {/if}
</svg>

<style>
  .line {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
</style>
