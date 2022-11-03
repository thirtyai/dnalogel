<script lang="ts">
  import type { Hooks, PointTagElement, State, TemporaryState, MediaStore } from '../typings'
  import TagWrapper from './TagWrapper.svelte'

  export let withAnimation = false
  export let tags: PointTagElement[] = []
  export let hooks: Hooks
  export let state: State
  export let mediaStore: MediaStore
  export let temporaryState: TemporaryState
</script>

{#if state.enabled}
  <div class="tag--container" class:hide={!state.visible || !temporaryState.visible} class:withAnimation>
    {#each tags as tag (tag.id)}
      <div
        class="tag"
        class:hide={!tag.pointTagStyle?.leftPercent ||
          !tag.pointTagStyle?.topPercent ||
          tag.enabled === false ||
          !tag.state ||
          tag.temporaryState?.visible === false}
      >
        <TagWrapper {...{ tag, hooks, state, mediaStore, temporaryState, withAnimation }} />
      </div>
    {/each}
  </div>
{/if}

<style>
  .tag--container {
    /* background: white; */
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 1;
    user-select: none;
  }

  .tag.hide {
    display: none;
  }

  .withAnimation {
    transition: opacity 0.3s linear;
  }

  .tag--container.hide {
    opacity: 0;
    pointer-events: none;
  }

  .tag--container.hide :global(*) {
    pointer-events: none;
  }
</style>
