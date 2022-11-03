<!-- 图文标签 -->
<script lang="ts">
  import type { TagElement, ContentType, MediaStore } from '../../typings'
  import uuid from '../../../shared-utils/uuid'
  import Text from '../Common/Text.svelte'
  import Arrow from '../Common/Arrow.svelte'
  import Audio from '../Common/Audio.svelte'
  import Line from '../Common/Line/Straight.svelte'
  import Shadow from '../Common/Shadow.svelte'
  import MultiLineText from '../Common/MultiLineText.svelte'

  export let tag: TagElement<ContentType.Audio>

  let textUnfolded = false
  let contentWidth: number
  let textItems: { id: string; content: string }[] = []
  $: unfolded = !!tag.state?.unfolded
  $: text = tag.data.text

  $: {
    // 当 text 变了后，强制更新 Text
    textItems = [{ id: uuid(), content: text }]
  }

  // 收起的时候，如果文字展开了，要先下下去，再收起
  $: foldTextDelay = textUnfolded ? 450 : 0

  function clickContent() {
    textUnfolded = !textUnfolded
  }
</script>

{#if tag.state}
  <div class="audio-tag" class:unfolded>
    <Shadow visible={unfolded} left={contentWidth / 2 + 'px'} bottom={12} width={2} blurRadius={120} spreadRadius={60} />
    <div class="line" style:width={contentWidth + 'px'}>
      <Line {unfolded} duration={1000} outDelay={foldTextDelay + 20 * Math.min(textItems[0]?.content.length ?? 10, 15)} />
    </div>
    <div class="content" bind:clientWidth={contentWidth}>
      <div class="wrapper">
        <div class="audio-icon">
          <Audio
            {unfolded}
            url={tag.data.audioUrl}
            duration={1000}
            outDelay={20 * Math.min(textItems[0]?.content.length ?? 10, 15)}
            hooksInfo={{ tag }}
          />
        </div>
        <div style:display="inline-block" on:click={clickContent}>
          <MultiLineText visible={unfolded} {textUnfolded} {textItems} />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .audio-tag {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    overflow: visible;
  }

  .line {
    display: flex;
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
    bottom: 2px;
    overflow: hidden;
    box-sizing: border-box;
    font-size: 0;
    white-space: nowrap;
    font-weight: 600;
  }

  .wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .audio-icon {
    vertical-align: top;
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 4px;
    margin-top: 1px;
  }
  .unfolded .audio-icon {
    pointer-events: auto;
  }
</style>
