<script lang="ts">
  import type { ObjectFit, MediaData } from '../../typings'
  import { Image_Play_Large, Image_Play_Small } from '../../Assets/Icon'

  export let media: (MediaData & { name?: string }) | undefined
  export let playButtonIfNeed: 'small' | 'large' = 'small'
  export let canPlay = true
  export let objectFit: ObjectFit = 'cover'
  let videoInstance: HTMLVideoElement | undefined
  let showPlayButton = false
  $: {
    if (videoInstance) {
      showPlayButton = videoInstance.paused
      videoInstance.addEventListener('play', () => {
        showPlayButton = false
      })
      videoInstance.addEventListener('pause', () => {
        showPlayButton = true
      })
    }
  }
</script>

{#if media}
  <div class="media-item">
    {#if media.type === 'Image'}
      <img class="media-content" style={`object-fit: ${objectFit};`} src={media.url} alt={media.name} />
    {:else if media.type === 'Video'}
      <!-- svelte-ignore a11y-media-has-caption -->
      <!-- video src '#t=0.1' 兼容 https://www.w3.org/TR/media-frags/ 3.2 Resolving URI fragments within the user agent -->
      <video
        class="media-content"
        style={`object-fit: ${objectFit};`}
        class:showPlayButton
        src={media.url + '#t=0.1'}
        poster={media.videoCoverUrl ?? undefined}
        preload={media.videoCoverUrl ? undefined : 'auto'}
        playsinline
        paused
        loop={false}
        crossorigin=""
        controls={false}
        on:click={() => videoInstance?.pause()}
        bind:this={videoInstance}
      />
      <div class="video-play-button-container" class:showPlayButton>
        <div class="video-icon" class:large={playButtonIfNeed === 'large'} class:small={playButtonIfNeed === 'small'}>
          <div
            class="video-icon-img"
            class:canPlay
            style="background-image: url({playButtonIfNeed === 'large' ? Image_Play_Large : Image_Play_Small});"
            on:click={() => {
              if (!canPlay) return
              if (videoInstance) {
                videoInstance.play()
              }
            }}
          />
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .media-item {
    height: 100%;
  }

  .media-content {
    width: 100%;
    height: 100%;
    user-select: none;
    object-fit: inherit;
  }

  .video-icon {
    width: 200px;
    height: 100px;
    max-width: 60%;
    max-height: 60%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .video-play-button-container {
    display: none;
    pointer-events: auto;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .video-play-button-container.showPlayButton {
    display: block;
  }

  .video-icon.large {
    width: 200px;
    height: 100px;
  }

  .video-icon.small {
    width: 28px;
    height: 28px;
  }

  .video-icon .video-icon-img {
    width: 100%;
    height: 100%;
    background-position: center center;
    background-size: contain;
    background-repeat: no-repeat;
  }
  .video-icon .video-icon-img.canPlay {
    cursor: pointer;
  }
</style>
