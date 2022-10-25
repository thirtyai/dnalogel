<script lang="ts">
  import type { Five } from '@realsee/five'
  import type { RoomLabel } from './typings'
  import { ROOM_LABEL_BG } from './Assets/roomLabelBg'

  export let five: Five
  export let roomLabel: RoomLabel

  function onClick() {
    five.setState({ panoIndex: roomLabel.panoIndex, mode: 'Panorama', longitude: roomLabel.longitude })
  }
</script>

<div
  class="room-label-item"
  style:z-index="{roomLabel.zIndex}"
  style:transform="{roomLabel.transform}"
  style:opacity="{roomLabel.visible ? 1 : 0}"
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span
    class="room-label-item__text"
    class:wide="{roomLabel.name.length > 3}"
    style="background-image: url({ROOM_LABEL_BG})"
    on:click="{onClick}">{roomLabel.name}</span
  >
  <div class="room-label-item__bar"></div>
</div>

<style>
  .room-label-item {
    position: absolute;
    font-size: 8px;
    z-index: 0;
    transform: none;
    cursor: pointer;
    pointer-events: none;
    user-select: none;
  }

  .room-label-item__text {
    position: absolute;
    left: 0;
    top: -64px;
    transform: translate(-50%, 0);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 20px;
    min-width: 32px;
    padding: 0 6px;
    pointer-events: all;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    white-space: nowrap;
  }

  .room-label-item__bar {
    position: absolute;
    top: -44px;
    height: 48px;
    width: 1px;
    background-image: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
  }

  .wide {
    font-size: 10px;
  }
</style>
