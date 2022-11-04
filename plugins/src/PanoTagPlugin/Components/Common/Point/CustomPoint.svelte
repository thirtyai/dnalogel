<script lang="ts">
  import { cubicInOut } from 'svelte/easing'
  import Shadow from '../Shadow.svelte'

  export let unfolded: boolean
  export let iconUrl: string
  export let foldDelay = 800

  $: folded = !unfolded
</script>

<div class="point" class:folded class:unfolded>
  <Shadow center blurRadius={12} spreadRadius={5} />
  <!-- 小点 -->
  <div class="small-point" style:transition-delay={folded ? foldDelay + 'ms' : '0ms'} />
  <!-- 带图标的大圈 -->
  <div class="big-point" style="--iconUrl: url({iconUrl});" style:transition-delay={folded ? foldDelay + 'ms' : '0ms'} />
</div>

<style>
  .point {
    pointer-events: none;
    width: 24px;
    height: 24px;
  }
  .small-point,
  .big-point {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 500ms;
  }
  .big-point {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .folded.point {
    animation: breathing 2s linear infinite;
  }

  .big-point::before,
  .big-point::after {
    content: '';
    display: block;
    position: absolute;
    background-size: contain;
    background-repeat: no-repeat;
    pointer-events: none;
  }

  /* 光圈 */
  .big-point::before {
    width: 100%;
    height: 100%;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAqFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8j1z1tAAAAOHRSTlMABgoNFBsYIhEmHyksMoJ6RZ5aXzpnU03AtqaZjLuGN+zcifnW0cjEqnA+lOZzbWLhkH6i8rGuagnOwPMAAAQOSURBVFjDrZiHctpAEIYXYzvGOvXeUe+IYuD93ywrJAIhFJX8M8zoBHzz757utHvwTETJHJPfGQZfWJXILWCMPuqNbuu6vj+khrHjed40TWvFfQ2jvCl8nGha6lQCl7s07UqcUlfOZrOxVtKsN2a+0uJYK+ScEIqiFifhBSGSsnJ8f8u99cLMVnEUHTKXIOMX6vuk5gpphFYyhmHzHpzcDqNUJGgEER+oz5OaK8ShNcIdt+zx1ys7lhdqiDlRkPF+JaSdWIhasaz6lLPQ1qFDIwYpDeTr62veCS8bGLIQRSsVK78/5nDeOlYIYhovHeOtU0dDXw2KSGiKesQRyjJ10Q66QcyZMTvpTEMUumpMieyWvs9ZLZcmodAOYlorsysBflpjiEJTFBEY5+7sicul34T1iak5U25momN9Ya4wPCT57r8cteW0dk4YuKMTqjXVkgjciFr+8B3ngnmM6kii5X/efB0F+jUHnuiatLJY+Et84EnUNacfiaKZjQhX4oJAwPlqOB3mJaoh4dxxG5Nc3Q8DkywunP6kBalN53J7G3g0JqiNC3qpjQ7TRPvmn2U3L3/kU4JaTn/SKU0qb76dDf0kGNjHJbD+wX1gcMxO6fZVrzXUcQaROkvt3+pljIYugQ0LDi1ZBgeN9JK9MjTCkmgwgPou19I5QzBI5yy5RvqOw6xMMbKzoeGWmnQfBBwa6woj6wyNsYSx7R0chWuOwsjOqR6aboyNyvcpgOsl3ZzNhoNm3bztdAK1x5NuzmCwunkjjq4AEzKXFI1NUmVnwIfydJBoW7CPVAR1uR6XbVwlmgF2xF1yPTbbubYHLZamgyTNhiSmp4PoJIEk+R+gOAFb+x+hxRoctHw6iItsMLT/Mf3RHixbnP5AyhEPmZ1NB+E6A0V3pi9aPqyB6Pz0bSTxXID0kE/d2DgvxBFzEKdutdXawJGSMlM3/3Sd4fA93bnTXkfSuvwGFGOI016QbKm3VdbOn/bKjpd1e6Pg1SlFhPzjdXWNwjNTyprkhz33i4Wpji600FA5h05q4Ywv/bxge7mNRe7YYtQMwqt/kMLixpXHQhBwcCXBYukxBbvkBTv4S5V/HNNC6EF089tPxxGHNzV8sKTgRhSzVYa2Wf5yeadHphlWGdb4IUeEO5K2SHrUiqJuW9GiLFdwVzRbCXTf5tg11mvhYdufZbLUr11XEi/k4KHexUxWSY8DBCby7AU8E3eUhfzVkYZgR6H/agF8C3KNqCeHLIIRR7oEr0XXsixy9P1jH/doJLF2nPXbIlw5y1aC6t4eROW1pduaLs/7b6NEqFiWrWpBzaXuaOy4Nfe6bRfqGwzSXBJZhnF8y9oUhcnzOyM9pI7wCWP0LSkyy1iFWWwsFp8LeKLfd4doRyTLRacAAAAASUVORK5CYII=);
  }
  .folded .big-point::before {
    animation: rotate 2s linear infinite;
  }
  /* 自定义icon */
  .big-point::after {
    position: absolute;
    width: 16px;
    height: 16px;
    background-image: var(--iconUrl);
  }

  .small-point::before {
    content: '';
    display: block;
    position: absolute;
    pointer-events: none;
    width: 4px;
    height: 4px;
    border-radius: 100%;
    background-color: white;
  }

  /** 动画 */
  .folded .big-point {
    opacity: 1;
    scale: 1;
  }

  .unfolded .big-point {
    opacity: 0;
    scale: 0;
  }

  .folded .small-point {
    opacity: 0;
    scale: 6;
  }

  .unfolded .small-point {
    opacity: 1;
    scale: 1;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes breathing {
    0% {
      transform: scale(1);
    }
    25% {
      transform: scale(0.9);
    }
    50% {
      transform: scale(1);
    }
  }
</style>
