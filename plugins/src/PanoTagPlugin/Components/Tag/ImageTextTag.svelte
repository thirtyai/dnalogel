<!-- 图文标签 -->
<script lang="ts">
  import type { TagElement, ContentType } from '../../typings'
  import uuid from '../../../shared-utils/uuid'
  import Text from '../Common/Text.svelte'
  import Line from '../Common/Line/Polyline.svelte'
  import Media from '../Common/Media.svelte'
  import Shadow from '../Common/Shadow.svelte'

  export let tag: TagElement<ContentType.ImageText>

  $: unfolded = tag.state ? tag.state.unfolded : false
  $: content = (tag.data.text?.length ?? 0) > 7 ? tag.data.text?.substring(0, 6) + '...' : tag.data.text
  $: mediaData = tag.data.mediaData
  let textItems: { id: string; content: string }[]

  $: {
    // 当 text 变了后，强制更新 Text
    textItems = content ? [{ id: uuid(), content }] : []
  }
</script>

{#if tag.state}
  <Shadow visible={unfolded} left={61} bottom={57} width={2} blurRadius={150} spreadRadius={75} />
  <div class="line">
    <Line {unfolded} duration={1000} outDelay={400} />
  </div>
  {#each textItems as { id, content } (id)}
    <div class="text">
      <Text {unfolded} {content} inDelay={500} />
    </div>
  {/each}
  {#if mediaData}
    <div class="media-wrapper">
      <Media
        autoplayConfig={{ autoplay: false }}
        {unfolded}
        {mediaData}
        {tag}
        enableCarousel={false}
        canPlay={false}
        playButtonIfNeed="small"
        inDelay={500}
        duration={500}
      />
    </div>
  {/if}
{/if}

<style>
  .line {
    position: absolute;
    width: 105px;
    height: 21px;
    transform: translateY(-100%);
  }

  .text {
    position: absolute;
    width: 100px;
    left: 16px;
    bottom: 1px;
    font-weight: 600;
  }

  .media-wrapper {
    position: absolute;
    left: 14px;
    top: -85px;
    width: 90px;
    height: 60px;
    font-weight: 600;
  }
</style>
