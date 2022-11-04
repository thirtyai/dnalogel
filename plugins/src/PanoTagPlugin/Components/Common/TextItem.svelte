<script lang="ts">
  import { cubicInOut } from 'svelte/easing'

  export let index: number
  export let rightIndex: number
  export let visible: boolean
  export let content: string

  function fly(node: HTMLSpanElement, { duration }: { duration: number }) {
    return {
      duration,
      delay: index * 40,
      css: (t: number) => {
        const eased = cubicInOut(t)
        return `
          transform: translate(${4 * (1 - eased)}px, ${10 * (1 - eased)}px) scale(${0.7 + eased * 0.3}) rotate(${20 * (1 - eased)}deg);
          opacity: ${eased};`
      },
    }
  }

  function flyOut(node: HTMLSpanElement, { duration }: { duration: number }) {
    return {
      duration,
      delay: rightIndex * 40,
      css: (t: number) => {
        const eased = cubicInOut(t)
        return `
          transform: translate(${4 * (1 - eased)}px, ${10 * (1 - eased)}px) scale(${0.7 + eased * 0.3}) rotate(${20 * (1 - eased)}deg);
          opacity: ${eased};`
      },
    }
  }
</script>

{#if visible}
  <span class="text-char" in:fly|local={{ duration: 400 }} out:flyOut|local={{ duration: 400 }}>{content}</span>
{/if}

<style>
  .text-char {
    opacity: 1;
    display: inline-block;
    transform: translate(0, 0) scale(1) rotate(0);
  }
</style>
