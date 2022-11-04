<script lang="ts">
  import { TagElement, ContentType, Hooks, State, TemporaryState, MediaStore } from '../../typings'
  import TextTag from './TextTag.svelte'
  import ImageTextTag from './ImageTextTag.svelte'
  import MarketingTag from './MarketingTag.svelte'
  import { noTypecheck } from '../../utils'
  import { setContext } from 'svelte'
  import AudioTag from './AudioTag.svelte'
  import MediaPlane from './MediaPlane.svelte'
  import LinkTag from './LinkTag.svelte'
  import CustomTag from './CustomTag.svelte'

  export let withAnimation = false
  export let tag: TagElement
  export let hooks: Hooks
  export let state: State
  export let mediaStore: MediaStore
  export let temporaryState: TemporaryState

  $: unfolded = tag.state?.unfolded
  $: visible = tag.state?.visible
  $: isVisible = state.visible && temporaryState.visible && visible
  $: tagId = tag.id

  setContext('hooks', hooks)
  setContext('mediaStore', mediaStore)

  let lastVisibleState: boolean | undefined
  let lastUnfoldedState: boolean | undefined

  function exposureEmit(isVisible?: boolean) {
    if (isVisible) hooks.emit('exposure', { id: tagId, type: 'start' })
    else hooks.emit('exposure', { id: tagId, type: 'end' })
  }

  $: exposureEmit(isVisible)

  $: {
    if (tag.hooks) {
      if (unfolded !== undefined && unfolded !== lastUnfoldedState) {
        lastUnfoldedState = unfolded
        if (unfolded) tag.hooks.emit('unfolded')
        else tag.hooks.emit('folded')
      }
      if (visible !== undefined && visible !== lastVisibleState) {
        lastVisibleState = visible
        if (visible) tag.hooks.emit('show')
        else tag.hooks.emit('hide')
      }
    }
  }
</script>

<div
  class="content__container"
  class:disable={tag.enabled === false || tag.temporaryState?.visible === false}
  class:hide={!state.visible || !state.enabled || !temporaryState.visible || !tag.state?.visible}
  class:withAnimation
  class:unClickable={tag.clickable === false}
  style:width={tag.pointType === 'PointTag' ? 0 : '100%'}
  style:height={tag.pointType === 'PointTag' ? 0 : '100%'}
  data-id={tag.id}
  on:click|stopPropagation={(event) => hooks.emit('click', { event, target: 'TagContent', tag })}
>
  <div class="content__wrapper">
    <div class="content" class:unfolded={tag.state?.unfolded}>
      {#if tag.element}
        <CustomTag tag={noTypecheck(tag)} />
      {:else if tag.contentType === ContentType.Text}
        <TextTag tag={noTypecheck(tag)} />
      {:else if tag.contentType === ContentType.ImageText}
        <ImageTextTag tag={noTypecheck(tag)} />
      {:else if tag.contentType === ContentType.Audio}
        <AudioTag tag={noTypecheck(tag)} />
      {:else if tag.contentType === ContentType.Marketing}
        <MarketingTag tag={noTypecheck(tag)} />
      {:else if tag.contentType === ContentType.Link}
        <LinkTag tag={noTypecheck(tag)} />
      {:else if tag.contentType === ContentType.MediaPlane}
        <MediaPlane tag={noTypecheck(tag)} />
      {/if}
    </div>
  </div>
</div>

<style>
  @font-face {
    font-family: 'TG-TYPE';
    font-style: normal;
    font-weight: 400;
    /* src: local('TG-TYPE-Bold'), url(//vrlab-static.ljcdn.com/release/web/TG-TYPE-Bold.769fe64d.otf) format('woff2'); */
    src: local('TG-TYPE-Bold'),
      url(data:application/font-woff2;charset=utf-8;base64,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)
        format('woff2');
  }

  .content__container {
    position: relative;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-family: PingFangSC, Segoe UI, Rototo, sans-serif;
  }

  .content__container.unClickable {
    pointer-events: none !important;
  }

  .content__container.unClickable :global(*) {
    pointer-events: none !important;
  }

  :global(*) {
    -webkit-tap-highlight-color: transparent;
  }
  .content__wrapper {
    pointer-events: none;
    width: 100%;
    height: 100%;
  }

  .withAnimation {
    transition: opacity 0.3s linear;
  }

  .content__container.hide {
    opacity: 0;
    pointer-events: none;
  }

  .content__container.hide :global(*) {
    pointer-events: none !important;
  }

  .content__container.disable {
    display: none;
  }

  .content__container.hide :global(*) {
    pointer-events: none;
  }

  .content {
    position: relative;
    width: 100%;
    height: 100%;
    font-size: 12px;
    line-height: 18px;
    color: #fff;
  }
  .content:not(.unfolded) {
    pointer-events: none;
  }
  .content:not(.unfolded) :global(*) {
    pointer-events: none !important;
  }
  .content.unfolded {
    pointer-events: auto;
  }
</style>
