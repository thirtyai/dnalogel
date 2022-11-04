<script lang="ts">
  import { fade } from 'svelte/transition'
  import { Image_Arrow } from '../../Assets/Icon'
  import { cubicInOut } from 'svelte/easing'
  import Shadow from './Shadow.svelte'

  export let direction: 'left' | 'top' | 'right' | 'bottom' = 'right'
  export let visible = true
  export let duration = 0
  export let inDelay = 0
  export let outDelay = 0
</script>

{#if visible}
  <div class="arrow-wrapper">
    <Shadow center blurRadius={9} spreadRadius={3} />
    <div
      on:click
      in:fade|local={{ duration, delay: inDelay, easing: cubicInOut }}
      out:fade|local={{ duration, delay: outDelay, easing: cubicInOut }}
      class="arrow {direction}"
      style="background-image: url({Image_Arrow});"
    />
  </div>
{/if}

<style>
  .arrow {
    width: 100%;
    height: 100%;
    background-size: 100%;
    transition: transform 400ms ease-in-out;
    cursor: pointer;
    pointer-events: auto;
  }

  .arrow-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .arrow.left {
    transform: rotate(0deg);
  }

  .arrow.right {
    transform: rotate(-180deg);
  }

  .arrow.top {
    transform: rotate(90deg);
  }

  .arrow.bottom {
    transform: rotate(-90deg);
  }
</style>
