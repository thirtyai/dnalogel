<script lang="ts">
  import { noTypecheck } from '../utils'
  import { Hooks, PointTagElement, DimensionType, State, TemporaryState, ContentType, MediaStore, PointType } from '../typings'
  import TagContent from './Tag/index.svelte'
  import TagPoint from './Common/Point/PointSwitch.svelte'
  import { onMount } from 'svelte'

  export let withAnimation = false
  export let tag: PointTagElement
  export let hooks: Hooks
  export let state: State
  export let mediaStore: MediaStore
  export let temporaryState: TemporaryState

  $: show = tag.state?.visible
  $: hide = !show
  $: unfolded = tag.state?.unfolded
  $: left = tag.pointTagStyle?.leftPercent + '%'
  $: top = tag.pointTagStyle?.topPercent + '%'
  $: zIndex = tag.contentType === ContentType.Link ? 1 : 0

  let timeout: NodeJS.Timeout | undefined
  let animating = false

  function setAnimating(trigger: any) {
    if (timeout !== undefined) clearTimeout(timeout)
    animating = true
    timeout = setTimeout(() => {
      animating = false
    }, 800)
  }

  $: setAnimating(unfolded)

  const handlePointClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) => {
    if (animating) return
    hooks.emit('click', { event, target: 'TagPoint', tag })
  }
</script>

<div class="wrapper" class:hide class:unfolded style:left style:top style:z-index={zIndex} data-id={tag.id}>
  {#if tag.dimensionType === DimensionType.Two}
    <TagContent {mediaStore} {withAnimation} tag={noTypecheck(tag)} {hooks} {state} {temporaryState} />
  {/if}
  {#if tag.pointType === PointType.PointTag && tag.style?.point?.style !== 'noPoint'}
    <div class="point" on:click|stopPropagation={handlePointClick}>
      <TagPoint {tag} />
    </div>
  {/if}
</div>

<style>
  .wrapper {
    position: absolute;
    width: 0px;
    height: 0px;
    overflow: visible;
    pointer-events: auto;
  }

  .point {
    -webkit-tap-highlight-color: transparent;
    position: absolute;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
  }
</style>
