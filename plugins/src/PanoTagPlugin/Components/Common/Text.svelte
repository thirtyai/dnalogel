<script lang="ts">
  import anime from 'animejs'
  import { onMount } from 'svelte'
  import { notNil } from '../../../shared-utils/isNil'
  import { searchFirstValueSmallThanLastValue } from '../../utils'
  import { RANDON_STRING } from '../../utils/constants'

  export let inDelay = 0
  export let outDelay = 0
  export let content: string
  export let unfolded: boolean

  let timeoutID: NodeJS.Timeout
  let spanEleList: HTMLSpanElement[] = []
  let openAnimeIns: anime.AnimeInstance
  // v0.3.7 emoji support
  $: contentList = (() => {
    const result: string[] = []
    const emojiRegExp = new RegExp(
      /\p{Regional_Indicator}\p{Regional_Indicator}|\p{Emoji}(\p{Emoji_Modifier}+|\uFE0F\u20E3?)?(\u200D\p{Emoji}(\p{Emoji_Modifier}+|\uFE0F\u20E3?)?)+|\p{Emoji_Presentation}(\p{Emoji_Modifier}+|\uFE0F\u20E3?)?|\p{Emoji}(\p{Emoji_Modifier}+|\uFE0F\u20E3?)/gu,
    )
    // const sentence =
    //   'A ticket to 大阪 costs ¥2000 👌. Repeated emojis: 😁😁. Crying cat: 😿. Repeated emoji with skin tones: ✊🏿✊🏿✊🏿✊✊✊🏿. Flags: 🇱🇹🏴󠁧󠁢󠁷󠁬󠁳󠁿. Scales ⚖️⚖️⚖️.'
    // console.log(sentence)
    // console.log(sentence.match(emojiRegExp))
    const emojiSplitFlag = `__EMOJI_SPLIT_${RANDON_STRING}__`
    const emojiFlag = `__EMOJI_${RANDON_STRING}__`
    content
      .slice()
      .replace(emojiRegExp, (emoji) => `${emojiSplitFlag}${emojiFlag}${emoji}${emojiSplitFlag}`)
      .split(emojiSplitFlag)
      .forEach((item) => {
        if (item.startsWith(emojiFlag)) return result.push(item.slice(emojiFlag.length))
        else return result.push(...item.split(''))
      })
    return result
  })()

  function onUnfoldedUpdate(unfolded: boolean) {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(
      function () {
        if (!openAnimeIns) return
        if ((unfolded && openAnimeIns.reversed) || (!unfolded && !openAnimeIns.reversed)) {
          openAnimeIns.reverse()
          openAnimeIns.play()
        }
      },
      unfolded ? inDelay : outDelay,
    )
  }

  onMount(function () {
    /** 计算第一行的最后一个字的index */
    const firstLineLastIndex = (() => {
      const resultIndex = searchFirstValueSmallThanLastValue(
        (index) => spanEleList[index]!.getBoundingClientRect().x,
        [Math.min(spanEleList.length - 1, 10), Math.min(spanEleList.length - 1, 30)],
      )
      if (resultIndex > 0) return resultIndex
    })()

    /** 文字依次从底部旋转出现
     * @member duration 单个文字的动画时间是 400ms
     * @member scale    大小缩放 [0.7 - 1]
     * @member rotate   旋转 [20 - 0]deg
     * @member opacity  透明度 [0 - 1]
     * @member translateX  水平方向位移 [4 - 0]px
     * @member translateY  水平方向位移 [10 - 0]px
     * @member delay  动画开始的延时是当前元素的索引 index * 50ms
     */
    openAnimeIns = anime({
      targets: spanEleList.slice(0, firstLineLastIndex).filter(notNil),
      autoplay: false,
      duration: 400,
      scale: [0.7, 1],
      rotate: [20, 0],
      opacity: [0, 1],
      translateX: [4, 0],
      translateY: [10, 0],
      delay: anime.stagger(50),
      easing: 'easeInOutCubic',
    })
    if (unfolded) openAnimeIns.seek(openAnimeIns.duration)
  })

  $: {
    onUnfoldedUpdate(unfolded)
  }
</script>

{#each contentList as item, index}
  <span bind:this={spanEleList[index]} class="text-char">{item}</span>
{/each}

<style>
  .text-char {
    text-shadow: 2px 0px 8px rgba(0, 0, 0, 0.15);
  }
</style>
