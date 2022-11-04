<script lang="ts">
  import type { TagElement, ContentType } from '../../typings'
  import Line from '../Common/Line/Straight.svelte'
  import uuid from '../../../shared-utils/uuid'
  import Shadow from '../Common/Shadow.svelte'
  import MultiLineText from '../Common/MultiLineText.svelte'

  export let tag: TagElement<ContentType.Text>

  let contentWidth: number
  let textUnfolded = false
  let textItems: { id: string; content: string }[] = []
  $: unfolded = !!tag.state?.unfolded
  $: text = tag.data.text

  $: {
    // 当 text 变了后，强制更新 Text
    textItems = [{ id: uuid(), content: text }]
  }

  // 收起的时候，如果文字展开了，要先下下去，再收起
  $: foldTextDelay = textUnfolded ? 450 : 0

  function toggleTextUnfolded() {
    textUnfolded = !textUnfolded
  }

  $: {
    if (!unfolded)
      setTimeout(() => {
        textUnfolded = false
      }, 20)
  }
</script>

{#if tag.state}
  <Shadow visible={unfolded} left={contentWidth / 2 + 'px'} bottom={12} width={2} blurRadius={120} spreadRadius={60} />
  <div class="line" style:width={contentWidth + 'px'}>
    <Line {unfolded} duration={1000} outDelay={foldTextDelay + 40 * Math.min(textItems[0]?.content.length ?? 10, 15)} />
  </div>
  <div class="content" bind:clientWidth={contentWidth} on:click={toggleTextUnfolded}>
    <MultiLineText visible={unfolded} {textUnfolded} {textItems} />
  </div>
{/if}

<style>
  .line {
    position: absolute;
    top: 0;
    left: 0;
    width: 162px;
    height: 1px;
    transform: translate3d(0, -50%, 10px);
  }

  .content {
    width: max-content;
    height: 54px;
    padding: 36px 4px 0 16px;
    position: absolute;
    left: 0;
    bottom: 0;
    overflow: hidden;
    box-sizing: border-box;
    font-size: 0;
    pointer-events: none;
    white-space: nowrap;
    font-weight: 600;
  }
</style>
