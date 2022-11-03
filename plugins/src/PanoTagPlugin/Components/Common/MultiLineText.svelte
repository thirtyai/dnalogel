<script lang="ts">
  import Text from '../Common/Text.svelte'
  import Arrow from '../Common/Arrow.svelte'
  import doUtil from '../../utils/doUtil'

  export let visible = false
  export let textUnfolded = false
  export let textItems: { id: string; content: string }[]

  let textElement: HTMLDivElement
  let translateY = 0
  let lineHeight = 0
  let textHeight = 0

  $: translateY = textUnfolded ? lineHeight - textHeight : 0
  $: transform = `translateY(${translateY}px)`
  $: arrowDirection = textUnfolded ? ('left' as const) : ('right' as const)
  $: foldTextDelay = textUnfolded ? 450 : 0

  $: {
    if (textElement && visible) {
      const { lineHeight: lineHeightString } = getComputedStyle(textElement)
      textHeight = textElement.offsetHeight
      doUtil(() => textElement?.offsetHeight, Boolean).then(() => {
        textHeight = textElement.offsetHeight
      })
      lineHeight = Number(lineHeightString.replace('px', ''))
    }
  }
</script>

{#each textItems as { id, content } (id)}
  <div bind:this={textElement} class="text" style:transform>
    <Text unfolded={visible} {content} inDelay={500} outDelay={foldTextDelay} />
  </div>
{/each}
{#if lineHeight < textHeight}
  <div class="arrow">
    <Arrow direction={arrowDirection} {visible} inDelay={600} duration={1000} />
  </div>
{/if}

<style>
  .text {
    pointer-events: auto;
    box-sizing: border-box;
    display: inline-block;
    max-width: 120px;
    transition: transform 400ms ease-in-out;
    font-size: 12px;
    line-height: 18px;
    white-space: initial;
    cursor: pointer;
  }

  .arrow {
    pointer-events: auto;
    display: inline-block;
    vertical-align: top;
    width: 14px;
    height: 14px;
    margin-left: 2px;
    margin-top: 2px;
  }
</style>
