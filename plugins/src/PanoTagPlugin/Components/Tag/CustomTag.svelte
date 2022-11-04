<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { TagElement } from '../../typings'

  export let tag: TagElement<any>
  let content: HTMLElement | undefined
  let destroyTemplate: () => any | undefined

  onMount(() => {
    if (content) {
      if (tag.element instanceof Element) {
        const element = tag.element
        content.appendChild(element)
        destroyTemplate = () => content?.removeChild(element)
      } else if (typeof tag.element === 'function') {
        const renderer = tag.element
        destroyTemplate = renderer(content)
      }
    }
  })

  onDestroy(() => {
    destroyTemplate?.()
  })
</script>

<div class="customElement__container" bind:this={content}>
  {#if typeof tag.element === 'string'}
    {@html tag.element}
  {/if}
</div>

<style>
  .customElement__container {
    position: relative;
  }
</style>
