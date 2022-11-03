<script lang="ts">
  import type { Hooks, MediaStore } from '../../typings'
  import { fade } from 'svelte/transition'
  import { cubicInOut } from 'svelte/easing'
  import Shadow from './Shadow.svelte'
  import { getContext } from 'svelte'

  export let inDelay = 0
  export let outDelay = 0
  export let duration = 0
  export let url: string
  export let unfolded: boolean
  export let hooksInfo: Record<string, any> = {}

  const hooks = getContext<Hooks>('hooks')
  const mediaStore = getContext<MediaStore>('mediaStore')

  let audio: HTMLAudioElement
  let paused = true

  mediaStore.subscribe(({ currentMediaUrl }: { currentMediaUrl: string }) => {
    if (currentMediaUrl !== url) audio?.pause()
  })

  $: {
    if (!unfolded) audio?.pause()
  }

  function onClick(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    mediaStore.set({ currentMediaUrl: url })
    if (!audio) return
    hooks.emit('click', { event, target: 'AudioTagPlayIcon', audioInstance: audio, ...hooksInfo } as any)
    audio.paused ? audio.play() : audio.pause()
    audio.onplay = (event) =>
      hooks.emit('playStateChange', { event, state: 'playing', mediaInstance: audio, ...(hooksInfo as { tag: any }) })
    audio.onpause = (event) =>
      hooks.emit('playStateChange', { event, state: 'paused', mediaInstance: audio, ...(hooksInfo as { tag: any }) })
  }
</script>

{#if unfolded}
  <div
    class="audio"
    class:paused
    on:click|stopPropagation={onClick}
    in:fade|local={{ duration, delay: inDelay, easing: cubicInOut }}
    out:fade|local={{ duration, delay: outDelay, easing: cubicInOut }}
  >
    <Shadow center blurRadius={15} spreadRadius={6} />
    <div class="audio-icon" />
    <audio bind:this={audio} bind:paused controls={false} playsInline src={url} />
  </div>
{/if}

<style>
  .audio {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  @keyframes playing {
    25% {
      background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='9' cy='9' r='8' transform='translate(-1 -1)' fill='%23FFF' fill-rule='nonzero'/%3E%3C/svg%3E");
    }

    50% {
      background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM5.533 6.685L4.169 8.049l1.414 1.413a2.078 2.078 0 0 0-.05-2.777z' fill='%23FFF' fill-rule='nonzero'/%3E%3C/svg%3E");
    }

    75% {
      background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm-.656 4.874l-.906.905A3.35 3.35 0 0 1 7.369 8.1c0 .875-.333 1.67-.88 2.268l.906.906A4.628 4.628 0 0 0 8.65 8.101a4.627 4.627 0 0 0-1.306-3.227zm-1.811 1.81L4.169 8.05l1.414 1.413a2.078 2.078 0 0 0-.05-2.777z' fill='%23FFF' fill-rule='nonzero'/%3E%3C/svg%3E");
    }
  }

  .paused .audio-icon {
    animation: none;
  }

  .audio-icon {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-size: 100%;
    animation: playing 2s steps(1) infinite;
    background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm1.428 2.79l-.953.952a6.222 6.222 0 0 1 1.775 4.36c0 1.571-.58 3.006-1.538 4.103l-.184.202.793.794a7.344 7.344 0 0 0 2.21-5.26A7.341 7.341 0 0 0 9.428 2.79zM7.344 4.873l-.906.905A3.35 3.35 0 0 1 7.369 8.1c0 .802-.28 1.537-.748 2.115l-.132.153.906.906A4.628 4.628 0 0 0 8.65 8.101a4.627 4.627 0 0 0-1.306-3.227zm-1.811 1.81L4.169 8.05l1.414 1.413a2.078 2.078 0 0 0-.05-2.777z' fill='%23FFF' fill-rule='nonzero'/%3E%3C/svg%3E");
  }
</style>
