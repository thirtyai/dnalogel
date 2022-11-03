<!-- 营销标签 -->
<script lang="ts">
  import type { TagElement, ContentType } from '../../typings'
  import Shadow from '../Common/Shadow.svelte'

  export let tag: TagElement<ContentType.Marketing>

  $: unfolded = tag.state?.unfolded ?? false
  $: folded = !unfolded
  $: data = tag.data

  // 大小点切换时长/线条开始生长时间
  const bigSmallDotChange = 400
  // 线条生长时长
  const lineGrow = 500
  // 线条开始生长后x秒标签开始出现
  const tagContentShowWhenLineStartGrow = 180
  // 标签出现时长
  const tagContentShow = 500
</script>

<div class="marketing" class:unfolded class:folded>
  <Shadow visible={unfolded} outDelay={500} left={61} bottom={87} blurRadius={150} spreadRadius={75} />
  <div
    class="line"
    style:transition-delay={unfolded ? bigSmallDotChange + 'ms' : tagContentShowWhenLineStartGrow + tagContentShow - lineGrow - 40 + 'ms'}
  />
  <div class="content" style:transition-delay={unfolded ? bigSmallDotChange + tagContentShowWhenLineStartGrow + 'ms' : '0ms'}>
    <img class="headerImage" src={data.headerPictureUrl} alt="" />
    <div class="tag">
      {#each data.brandTags || [] as tag}
        {#if tag}
          <div class="base-tag primary-tag">{tag}</div>
        {/if}
      {/each}
      {#each data.tags || [] as tag}
        {#if tag}
          <div class="base-tag secondary-tag">{tag}</div>
        {/if}
      {/each}
    </div>
    <div class="title">
      <div class="text">{data.title}</div>
    </div>
    <div
      class="footer"
      style:height={data.price?.value !== undefined && data.price?.value !== null && data.highlightText ? undefined : '1rem'}
    >
      {#if data.price?.value !== undefined && data.price?.value !== null}
        <div class="price">
          <span class="value">
            {data.price.value}
          </span>
          {#if data.price.unit}
            <span class="unit">
              {data.price.unit}
            </span>
          {/if}
        </div>
      {/if}
      {#if data.highlightText}
        <div class="goto-button goto-icon">
          {data.highlightText}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  * {
    box-sizing: border-box;
  }

  .marketing {
    transform: translateY(-100%);
  }

  .content .headerImage {
    position: absolute;
    width: 100%;
    top: 4px;
    transform: translateY(-100%);
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  .line {
    position: absolute;
    height: 33px;
    width: 1px;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    bottom: 0;
    transform-origin: bottom;
    transition: all 500ms;
  }

  .content {
    background-color: white;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 178px;
    width: max-content;
    height: max-content;
    border-radius: 4px;
    top: -30px;
    left: -16px;
    padding: 8px 0px 9px;
    transition: all 500ms;
  }

  .title {
    position: absolute;
    background-color: white;
    border-radius: 4px;
    width: 100%;
    top: 8px;
    padding-left: 12px;
    padding-right: 12px;
  }

  .title .text {
    display: block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-weight: bold;
    line-height: 18px;
    color: #000;
  }

  .footer {
    position: relative;
    padding-left: 12px;
    padding-right: 12px;
    width: 100%;
    height: 22px;
    display: flex;
    align-items: center;
  }

  .footer .goto-button {
    flex-shrink: 0;
    white-space: nowrap;
    background-image: linear-gradient(to right, rgba(87, 144, 253, 1) 0, rgba(42, 114, 254, 1) 100%);
    color: #fff;
    font-size: 10px;
    border-radius: 14px;
    font-weight: bold;
    padding-left: 8px;
    padding-right: 8px;
    height: 20px;
    margin-left: auto;
    display: flex;
    align-items: center;
  }
  .footer .goto-icon::after {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAAeFBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////GqOSsAAAAJ3RSTlMAFNO2pYt4bErz8uP6ysawgVtBPDcR5C4s2L6ZmJBzZGJXUyEeDws/0G2zAAAAkklEQVQ4y+3TRw6DMBAF0OAeJ3QCpCe0uf8NwRILLBYfiS1/aT3JoymnI+sERZ5VCH0iVto3QDfBLmeSSMUTogRV9bBEpJAKaYpGijn13aTSLeraeG9D0NZFZv4/rRL5FDHnITlllqjv6tykWsmX4JHr05y7j6oFKq2P8He48B0tAM0EY0EDxquClw6vLz6EI35GmwwSZpe+WOgAAAAASUVORK5CYII=);
    background-size: 100% auto;
    background-repeat: no-repeat;
  }

  .price {
    flex-shrink: 0;
    margin-right: 12px;
    white-space: nowrap;
    color: #ff6600;
    display: flex;
    align-items: baseline;
  }
  .price .value {
    position: relative;
    top: 1px;
    font-size: 18px;
    line-height: 22px;
    font-family: TG-TYPE, PingFangSC, Segoe UI, Rototo, sans-serif;
    letter-spacing: 0px;
  }
  .price .unit {
    padding-left: 2px;
    font-size: 10px;
  }

  .tag {
    position: relative;
    background-color: white;
    display: flex;
    width: max-content;
    padding-left: 12px;
    padding-right: 12px;
    min-height: 28px;
  }
  .tag .base-tag {
    height: 16px;
    margin-top: 22px;
    margin-bottom: 8px;
    margin-right: 4px;
    font-size: 10px;
    line-height: 14px;
    padding: 1px 4px;
    border-radius: 2px;
    overflow: hidden;
  }
  .tag .primary-tag {
    background: #e5eefe;
    color: #0055ff;
  }
  .tag .secondary-tag {
    background: rgba(255, 102, 0, 0.08);
    color: rgba(255, 102, 0, 1);
  }

  /** 动画 */
  .unfolded .line {
    transform: translateX(-50%) scale(1, 1);
    /* transition-timing-function: ease-out; */
  }
  .folded .line {
    transform: translateX(-50%) scale(1, 0);
    transition-timing-function: ease-in;
  }
  .unfolded .content {
    opacity: 1;
    /* transition-timing-function: ease-out; */
  }
  .folded .content {
    opacity: 0;
    transform: translateY(0.425rem);
    transition-timing-function: ease-in;
  }
</style>
