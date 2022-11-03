<script lang="ts">
  import { TagElement, ContentType, LinkType } from '../../typings'
  import Shadow from '../Common/Shadow.svelte'

  export let tag: TagElement<ContentType.Link>

  $: data = tag.data
</script>

<div class="wrapper">
  <div class="icon">
    {#if data.linkType === LinkType.VrLink}
      <Shadow visible={true} outDelay={0} inDelay={0} height={1.2} left={13} bottom={12} blurRadius={50} spreadRadius={18} />
      <div class="arrow0" />
      <div class="arrow1" />
      <div class="arrow2" />
    {:else if data.linkType === LinkType.NormalLink}
      <Shadow visible={true} outDelay={0} inDelay={0} width={1.4} left={13} bottom="auto" blurRadius={50} spreadRadius={18} />
      <div class="link" />
    {/if}
  </div>
  <div class="text-wrapper">
    <Shadow
      visible={true}
      outDelay={0}
      inDelay={0}
      left="auto"
      bottom="auto"
      width="80%"
      blurRadius={40}
      spreadRadius={16}
      opacity={0.08}
    />
    <div class="text">{data.text}</div>
  </div>
</div>

<style>
  .wrapper {
    font-weight: 600;
    cursor: pointer;
    width: max-content;
    height: max-content;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    pointer-events: auto;
  }
  .text-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon {
    position: relative;
    margin-bottom: 11px;
  }

  .arrow0,
  .arrow1,
  .arrow2 {
    position: absolute;
    width: 26px;
    height: 12px;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE4AAAAkCAYAAAAnxQwhAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAATqADAAQAAAABAAAAJAAAAABrx2urAAAGm0lEQVRoBd2ZXbCVUxjH26QSfSCS0JwoFNEZ0cc45iSmUUaqC+KCwUUXxYUZw4yrLhozLlDDRWa6oW5yOFTT0IcyKn1JnIjDKelLPipJcXT8fttaZ95qd+yzv+uZ+e211rvfd61n/ddaz1rv3qkOFWgtLS3n4Vb34NqhVCr1d6W5mao0hxBNwfrCOcG346S7Ee9gKFdEUjHCIZi+XA69E8p4rQVM98EeBLRcdqsI4RCtI0r0h4uCIvo1BZx1b4GzTjsA3yFec7pUxo+yC4doXen/IDg/6GB5GlSH8mbSWXA4lI+SNiDekVAuS1JW4RCtF72+EWI8c6k+A6ZJc5m+BHvCxX9ItyLe/lAueVIW4UI8u4beDkj02FnnTOuUuJbM/kVhNjQkLjaSbyxH3Cu5cIjmUWMoOKti+2PIT4JsrI6blkKMe87GTYhX0iNLdDwbh/O+B9G6UclIMNWcXQ/CrRbaYRu5dz44C7XfYTXimZbESiYconk2GwGdwSOF4j0JV0AuZrybA4plfYq4BvF2kRbdSiIcog2hJ+6StmcnFesJ6AL52DEefgOiWNa/EfG25FNpNs8WVbgQz+7EEc9o0RRxYiwUKDXuJcVqovxRMeNe0YRDtB44Pw4uAc0jx2gYZqEItoE63TSc0fILLEa8oryqFUU4ROuH04oWl6I76WQwzhXTXLILIO6wLuVFiLedtKBWcOEQ7XY8rE146ZvAwxDfDBJfFSX7J7XOgz8Sta9AvE8T5byzBRMuxLP78Mg3Ac3l0gcmWCiD1dPmboh9/JL8+4WKe7HSvPqFaL6cTwGF0jyc3gTOvnLaehr/HOIrnUeYeYj3W75O5S0covnq9AhcEJxpJr0Lrgrlcic7cWAZ+AuM5o8DbyJeY7qU40dewiFaDe26FOOIKppl41olmWK9C1E8V0Q94q3M1cmchAvx7CEaHZ5oWKfGJ8qVmF2EU75hxH67YcxHQK+1y2IFWT+EaBdz81SoCg+59fvCXuh4tjnUf0tIC5WsoyJjnUckbTu8hni/WsjW2iUcog2k4unQPTTglm/HPLcVwpqoZCu4lOLxxeOFocCfneJgkc3LfuDpzyDG5UPkZyHetmxrzVo4RLubSh+FGM8OkHcTuBDyMUfaTihQHJBYn0cafTTVfKFX0KHgzM/HDvPwcugZKnGw5iLeh6HcZvK/woV45gu5wkVTtLGxkEN6jGc2gaJ5lDkXtCjUXvIrQf9qoDckzU56pFC8augMudoSHoziWcdSmIOA8e3Da6dYm8Ihmu+Zz8H14ckYWHONZ19Qz4+go53A9qNYLvtPYBlON5C2Gn4MpuDsHgVxecXvHQQH8krw7JiLuUnohz5pX8NM/PB9N6OdVjicNaa8AHFJROeqMtZ0+ovGk2/AI0o3iGKRTcey9aSO8locbXN3wyc75k4+BoaBYSNZ3yHKHj2ug6uhPdbEzQ6qK0ARXQ0z8MmYe4plFA4Hx3Hn0xB3Hiv0V9qTYxCXMpoie2LX+vyXnPDpiH4Ay3HMe9tt+NiTh0bDPRBXRLIed07tZvDebEzhN4CzV3O5voyPi9KlxMcJwuGMQj0FE8M9Ku9I1MIJ94bvk4mNGORdcr41GLd8xjpM94HxZAmO7CAtmOF3Pyoz5srJ8bCZaw68M95NJU4GshlNf1dAf4i+15F/Bb9b416rGDRuPHsRHCHN2PEz3GahDXMq/wR9wfgTGyObFnE56ULwDxW/K5rRB/tTDa4YY2Imf3Zx/TIwFLVl6/iyF8SNxxX0LH1Ix720cDRoTJgNcbT2hwdUPZPZeCNYsc9EQazPEV4NTm9/zjlKWnKjT11otBYUcRS4AuKgmjrYToxrwUHPZN9z0Ql0afhyL+k0+rQtRQOu/3qIAhjIB0IPSJrrvwEcARvTko44896DhXFUvKESjD66msbD/eBMSw60eQVygAfDyXH8INe2gZPLiaF4ExTucTLPg2aMGg7uVpqzZwu4tm8Ad7UoFtn0q4ti1SHWt16odKO/A/DxAZgAcYVFt+3nV2AcHAIdQTsOa6Ea7P9MhZtB5jHQmsDltwMM8qrszFPpaEfILIYF4H+ZVnrGGf12coyEyXAvdIU4KUydaa4+r/cDl3UVaHMVzun7erp4+g/FWQWK5a6oeGeNoYHijAVFrIG44shmtKkK52x6FSZluMW4pVjvIJbHibPe0MPl61JWxEEZOvw216a3LkEeGMGFO0D1d8KqMyVu4WtRDE2Mh85Az6Wuso/RZA1ph38BBMvNbHuq7kAAAAAASUVORK5CYII=);
    background-repeat: no-repeat;
    background-size: contain;

    animation-fill-mode: backwards;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    animation-duration: 1.2s;
  }

  .arrow1 {
    position: relative;
  }

  .arrow0 {
    top: -12px;
    animation-name: up0;
  }
  .arrow1 {
    animation-name: up1;
  }
  .arrow2 {
    top: 12px;
    animation-name: up2;
  }

  .text {
    position: absolute;
    top: 0;
    font-size: 14px;
    color: #ffffff;
    letter-spacing: 0;
    text-align: center;
    max-width: 140px;
    width: max-content;
    word-break: break-all;
    line-height: 18px;
    text-shadow: 2px 0px 8px rgba(0, 0, 0, 0.15);
  }

  @keyframes up0 {
    0% {
      opacity: 0.8;
      transform: translate3d(0, 0, 0) scale(0.84);
    }
    33.33%,
    100% {
      opacity: 0;
      transform: translate3d(0, -12px, 0) scale(0.84);
    }
  }
  @keyframes up1 {
    0% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
    33.33%,
    100% {
      opacity: 0.8;
      transform: translate3d(0, -12px, 0) scale(0.84);
    }
  }
  @keyframes up2 {
    0% {
      opacity: 0;
    }
    33.33%,
    100% {
      opacity: 1;
      transform: translate3d(0, -12px, 0);
    }
  }

  .link {
    position: relative;
    width: 28px;
    height: 12px;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAAAkCAMAAAAgl+0yAAAAnFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+TINBkAAAAM3RSTlMAjLy6ILM2Fi+Zng3BrPvao4VC9ceneQfKkmNdV1AbEeLOsHA77ujUtn5JLnRraSUUjVLj/+RVAAABhElEQVRIx63V2W6CQBiGYUBUQGDYdwTZQZZa7v/eimik/ket/7yZ4yeTTCYf8+dOX8etxGVoxAvCVbguR3g0uRTMA0w4odGi+CbzFnGKosCqrmHc5rdEwzCwqtGFJlC7DqtOcTxANY67BHnVKOpVoEZRjFPdLgxbqIZhhFTjINChGgThF06NhpGd35OGMcCppyDPfajm+YhUR8cRoeo4+RGlJnnbalBt2x6nHh1dt4Gq6bqDU886y2ZQZVn9jFJ51vcbqPo+Up18UeSgKoo3nHqVJEkGqi1JPk49aLZmQdW2xXf1zP+vUFHsC1QVReK33xdk+w9SaqAq+732UvvdZ2UEqrud8lR5Wc4a7pO8GaoL9VBjy7rMlMosq1lV43LhZlrtF+yuJlbtEXpqXXP3NYwI8VJqakOIziw5aepV1FQuTdfhvlWVZdJCrao6MPe0spRpqV5ZFivqNqYpq3RQ2TST5/h4quoRCmwqq6rymol6plV53IZSomTKE/MroWfxDevL/wAEdPq1eGDh4AAAAABJRU5ErkJggg==);
    background-repeat: no-repeat;
    background-size: contain;

    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-duration: 1.2s;
    animation-name: left-right;
  }

  @keyframes left-right {
    0%,
    100% {
      opacity: 0.8;
      transform: translateX(-5px);
    }
    50% {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>
