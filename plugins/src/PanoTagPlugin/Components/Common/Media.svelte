<script lang="ts">
  import type { ObjectFit, MediaData, TagElement, MediaStore } from '../../typings'
  import { fly } from 'svelte/transition'
  import { linear } from 'svelte/easing'
  import { Swiper, SwiperSlide } from 'swiper/svelte'
  import type { Swiper as SwiperType } from 'swiper'
  import type { Hooks } from '../../typings'
  import { Autoplay } from 'swiper'
  import 'swiper/css'
  import 'swiper/css/autoplay'
  import { noTypecheck } from '../../utils'
  import MediaItem from './MediaItem.svelte'
  import { notNil } from '../../../shared-utils/isNil'
  import { getContext } from 'svelte'

  export let tag: TagElement<any>
  export let mediaData: (MediaData & { name?: string })[]
  export let inDelay = 0
  export let outDelay = 0
  export let duration = 0
  export let unfolded = true
  export let animation = true
  export let playButtonIfNeed: 'small' | 'large' = 'small'
  export let canPlay = true
  export let objectFit: ObjectFit = 'cover'
  export let enableCarousel = true
  export let autoplayConfig: { autoplay: boolean; autoplayVideo?: boolean } = { autoplay: true, autoplayVideo: false }

  $: carouselEnabled = enableCarousel && mediaData?.length > 1
  $: mediaDataList = mediaData
  $: autoplay = mediaDataList.length > 1 && autoplayConfig.autoplay

  const mediaStore = getContext<MediaStore>('mediaStore')
  const hooks = getContext<Hooks>('hooks')

  let swiperInstance: SwiperType | undefined

  function videoPlayHandler(this: HTMLVideoElement, event: Event) {
    if (!carouselEnabled) return
    if (!swiperInstance) return
    mediaStore.set({ currentMediaUrl: this.src })
    hooks.emit('playStateChange', { event, state: 'playing', tag, mediaInstance: this })
    swiperInstance.autoplay.stop()
  }

  function videoPauseHandler(this: HTMLVideoElement, event: Event) {
    if (!carouselEnabled) return
    if (!swiperInstance) return
    hooks.emit('playStateChange', { event, state: 'paused', tag, mediaInstance: this })
    if (!swiperInstance.autoplay.running) swiperInstance.autoplay.start()
  }

  $: {
    if (swiperInstance) {
      swiperInstance.slides.forEach((slide) => {
        const video = slide.querySelector('video')
        if (video) {
          mediaStore.subscribe(({ currentMediaUrl }: { currentMediaUrl: string }) => {
            if (currentMediaUrl !== video.src) video.pause()
          })
        }
      })
    }
  }

  let lastAutoPlayIndex: number | null = null
</script>

{#if unfolded}
  <div
    class="media"
    class:unfolded
    in:fly|local={animation ? { y: 4, duration, delay: inDelay, easing: linear } : undefined}
    out:fly|local={animation ? { y: 4, duration, delay: outDelay, easing: linear } : undefined}
  >
    {#if carouselEnabled}
      <Swiper
        style="height: 100%"
        modules={[Autoplay]}
        spaceBetween={30}
        autoplay={autoplay ? noTypecheck({ delay: 4000, stopOnLastSlide: false, disableOnInteraction: false }) : false}
        loop
        on:init={(event) => {
          swiperInstance = event.detail[0]
        }}
        on:slideChange={async (event) => {
          if (!autoplay) return
          if (!autoplayConfig.autoplayVideo) return
          const swiper = event.detail[0]
          if (!swiper) return
          const index = swiper.realIndex
          // loop 完一圈后，swiper.realIndex 会重复一次，比如有三张图片 [0,1,2]，slideChange 触发后输出的 index 为 [0,1,2,0,0,1,2,0,0,1,2,0,...], 添加 lastAutoPlayIndex 判断后，输出为[0,1,2,0,1,2,0,1,2,0,...]
          if (index === lastAutoPlayIndex) return
          lastAutoPlayIndex = index

          const media = mediaDataList[index]
          if (!media) return
          if (media.type !== 'Video') return

          // 先暂停自动轮播
          swiper.autoplay.stop()
          // 等待视频播放

          // 切换后暂停所有音频
          const allVideo = swiper.slides.map((element) => element.querySelector('video')).filter(notNil)
          allVideo.forEach((video) => video.pause())

          const video = swiper.slides[swiper.activeIndex]?.querySelector('video')

          if (video) {
            video.removeEventListener('play', videoPlayHandler)
            video.removeEventListener('pause', videoPauseHandler)
            video.addEventListener('play', videoPlayHandler)
            video.addEventListener('pause', videoPauseHandler)
          }

          // 兼容一下swiper bug
          if (video) {
            video.addEventListener('click', () => video.pause())
            const playButton = video.parentElement?.getElementsByClassName('video-play-button-container')?.[0]
            video.addEventListener('play', () => playButton?.classList.remove('showPlayButton'))
            video.addEventListener('pause', () => playButton?.classList.add('showPlayButton'))
            if (playButton) {
              if (video.paused) playButton.classList.add('showPlayButton')
              else playButton.classList.remove('showPlayButton')
              playButton.addEventListener('click', () => video.play())
            }
          }
        }}
      >
        {#each mediaDataList as media}
          <SwiperSlide>
            <MediaItem {media} {objectFit} {playButtonIfNeed} {canPlay} />
          </SwiperSlide>
        {/each}
      </Swiper>
    {:else}
      <MediaItem media={mediaData[0]} {objectFit} {playButtonIfNeed} {canPlay} />
    {/if}
  </div>
{/if}

<style>
  .media {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 2px;
  }
</style>
