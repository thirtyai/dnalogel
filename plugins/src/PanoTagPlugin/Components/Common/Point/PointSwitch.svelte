<script lang="ts">
  import { PointTagElement, ContentType } from '../../../typings'
  import CustomPoint from './CustomPoint.svelte'
  import DefaultPoint from './DefaultPoint.svelte'

  export let tag: PointTagElement
  $: foldDelay = tag.style?.foldedPointDelay ?? (tag.contentType === ContentType.Marketing ? 600 : undefined)
</script>

{#if tag.pointTagStyle?.leftPercent && tag.pointTagStyle?.topPercent && tag.enabled !== false && tag.state && tag.temporaryState?.visible !== false}
  {#if tag.contentType !== ContentType.Link}
    <!-- 标签比较小，加一个大一点的点击区域 -->
    <div class="point-click-helper" />
    {#if tag.style?.point?.style === 'CustomIcon' && tag.style?.point?.iconUrl}
      <CustomPoint iconUrl={tag.style.point.iconUrl} unfolded={tag.state.unfolded} {foldDelay} />
    {:else}
      <DefaultPoint unfolded={tag.state.unfolded} {foldDelay} />
    {/if}
  {/if}
{/if}

<style>
  .point-click-helper {
    position: absolute;
    /* cursor: pointer; */
    width: 40px;
    height: 40px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
</style>
