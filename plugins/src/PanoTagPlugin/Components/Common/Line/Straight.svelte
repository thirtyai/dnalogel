<script lang="ts">
  import { draw } from 'svelte/transition'
  import uuid from '../../../../shared-utils/uuid'

  export let inDelay = 0
  export let duration = 0
  export let outDelay = 0
  export let unfolded: boolean

  const defsID = uuid()
</script>

<svg class="straight-line" viewBox="0 0 148 1" preserveAspectRatio="none">
  <defs>
    <linearGradient id={defsID} gradientUnits="userSpaceOnUse">
      <stop offset="25%" stop-color="white" stop-opacity="1" />
      <stop offset="100%" stop-color="white" stop-opacity="0.5" />
    </linearGradient>
  </defs>
  {#if unfolded}
    <path
      in:draw|local={{ duration, delay: inDelay }}
      out:draw|local={{ duration, delay: outDelay }}
      fill="none"
      stroke="url(#{defsID})"
      stroke-width="1"
      d="M0 0.5 L 148 0.5"
    />
  {/if}
</svg>

<style>
  .straight-line {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
</style>
