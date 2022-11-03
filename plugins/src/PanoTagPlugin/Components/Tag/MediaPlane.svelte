<!-- 多媒体贴片; 营销贴片 -->
<script lang="ts">
  import type { TagElement, ContentType } from '../../typings'
  import Media from '../Common/Media.svelte'

  export let tag: TagElement<ContentType.MediaPlane>

  $: unfolded = tag.state ? tag.state.unfolded : false
  $: mediaData = tag.data.mediaData
  $: enableCarousel = tag.data.enableCarousel
  $: autoplayConfig = tag.data.autoplayConfig ?? { autoplay: enableCarousel ?? true, autoplayVideo: true }
  $: objectFit =
    tag.data.objectFit ??
    (() => {
      if (tag.data.adaptationMode === 'stretch') return 'cover'
      else if (tag.data.adaptationMode === 'proportional') return 'contain'
      else return undefined
    })()
</script>

{#if tag.state && mediaData}
  <div class="media-wrapper">
    <Media
      {unfolded}
      {mediaData}
      {objectFit}
      {enableCarousel}
      {autoplayConfig}
      {tag}
      canPlay
      playButtonIfNeed="large"
      inDelay={500}
      duration={500}
    />
  </div>
{/if}

<style>
  .media-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>
