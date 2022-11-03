# 1.2.*
## 1.2.6
 - fix: z-index 由10调整为1, 防止挡住其他插件（当初是因为汽车之家的问题改的10）

## 1.2.5
 - fix: video url添加'#t=0.1'兼容iphone的video preload不渲染第一帧的问题

## 1.2.4
 - feat: media 贴片播放/暂停事件

## 1.2.3
 - fix: disable后没有取消five监听的问题
 - fix: hide后部分元素可以点击的问题
 - fix: 标签圆点点击区域过大的问题

## 1.2.2
 - fix: 图文标签默认不可滑动
 - fix: media 组件 object-fit 不生效的问题
  
## 1.2.1
 - fix: 多行文字的箭头偶尔不显示的问题

## 1.2.0
 - feat: 恢复1.1.1 的 svelte的 ?? 语法
 - feat: 营销贴片轮播逻辑
 - fix: 点击bug

# 1.1.*
## 1.1.1
 - fix: dna不支持svelte的??语法，将svelte文件中的 ?? 语法改为函数

## 1.1.0
 - fix: 'exposure' hook fix
 - feat: config 'keep' API: visibleConfig.keep?: 'visible' | 'hidden'; unfoldedConfig.keep?: 'unfolded' | 'folded',  设置后会忽略其他 visibleConfig｜unfoldedConfig 配置

# 1.0.*
## 1.0.2-1.0.3
 - fix: 修复emoji正则打包报错问题，node低版本不支持部分Unicode property escapes的简写，导致打包失败，现改为全称

## 1.0.1
 - fix: 修复link标签和营销标签同时存在时，link标签箭头动画闪烁的问题
 - 尝试修复emoji正则在使用侧webpack打包时会报错的问题

## 1.0.0
 - feat: load 和 addTag 函数 { withAnimation: boolean } 默认值 false 改为 true

# 0.3.*
## 0.3.8
 - feat: load 和 addTag 函数新增 { withAnimation: boolean } 参数，用于控制load时是否开启动画

## 0.3.7
 - fix: 文字标签支持emoji

## 0.3.6
 - fix: 修复营销标签只有价格时的样式

## 0.3.5
 - feat: 3D标签修改dpr为undefined

## 0.3.4
 - feat: 添加配置: clickable: boolean, 贴片默认为false
 - change(className): tag2D__container to tag--container

## 0.3.3
 - fix: background color
 - fix: ResizeObserver undefined fix

## 0.3.2
 - fix: export typings/tag.ts

## 0.3.1
 - fix: set Shadow ZIndex -1 to undefined

## 0.3.0
 - change: 标签 index 文件部分导出类型与其他插件有冲突，不再在 index.ts 中导出，如有 import 需要，从 typings文件夹 中 import
 - feat style: linkTag VR跳转标签文字过长则折行显示

# 0.2.*
## 0.2.0
 - feat: 新的标签类型：营销贴片(mediaPanel)

# 0.1.*
## 0.1.7
 - fix: call load multiple times in 200ms will add mutiple resizeListener

## 0.1.6
 - feat: single tag hooks: show;hide;unfoled;folded

## 0.1.5
 - for 0.1.3 and 0.1.4 publish error

## 0.1.4
 - feat: url to base64

## 0.1.3
 - feat: export css3DScene

## 0.1.2
 - fix(css3dRender): rotate fix; panoTag custom string element fix

## 0.1.1
 - fix: customElement

## 0.1.0
 - feat: custom tag element; new config: "globalConfig.unfoldedConfig.autoUnfoldWhenHide = true"
 - feat: ImageVideo Tag type

# 0.0.*
## 0.0.46
 - feat: audiotag hooks

## 0.0.45
 - fix: dispose resize when dispose()

## 0.0.44
 - fix: disableFoldTag fold fix

## 0.0.43
 - fix: fold other tag when has tag auto unfold

## 0.0.42
 - fix: resize emit when load
 - feat: set five image
 - feat:bunlde package.json version into PanoTagPlugin

## 0.0.41
 - fix: off event listener bug

## 0.0.40
 - fix: content visible bug ; intersectRaycaster timing

## 0.0.39
 - fix: build error:em import package.json

## 0.0.38
 - fix: five element parentElement resize bug

## 0.0.37
 - fix: fix Audio Tag; package MultiLineText
 - fix: marketingTag default style

## 0.0.36
 - fix: fix clickhandler repeate execute
 - feat: resize observe
 - fix: 3DTag content visible bug; load function clear 3DTag bug

## 0.0.35
 - fix: add shadow animate local
 - fix: build error

## 0.0.34
 - fix: 3D to 2D svelte delay bug'
 - fix(style): fix marketTag fold Point style bug on jiaming's iphone13
 - feat(*): unfolded throttle replace click throttle; textTag fold animate fix;

## 0.0.33
 - fix: fix style;fix text length computed

## 0.0.32
 - fix(style): marketingTag point line malposition; text first line animate
 - fix: panoTagPlugin dispose

## 0.0.31
 - feat(*)
 - fix: build error

## 0.0.30
 - fix: marketing tag null value
 - fix(tag): 修复多媒体标签更改内容后动画部分失效
 - feat: setUnfold debounce
  
## 0.0.29
 - style
 - fix: unfolded tag zindex bigger than fold tag

## 0.0.28
 - fix: point change

## 0.0.27
 - fix: set linktag index 1;rm shadow animate local

## 0.0.26
 - fix: show/hide default value

## 0.0.25
 - fix: imagetextTag text ...
  
## 0.0.24
 - feat: show hide参数可配是否有动画；跳转标签点击事件修复；five mode切换提前展示标签修复；新增跳转标签阴影
 - fix(*): 修复 UI

## 0.0.23
 - 修复部分机型上换行错误

## 0.0.22
 - 删除无用代码
 - fix(*): 修复 UI
 - fix: imageText text can bo undefined

## 0.0.21
 - fix: tags.length === 0 reload
 - fix(*): 允许 B 端更改 Text
 - fix(*): fix ui

## 0.0.18
 - chore(*): 删除注释
 - fix(*): fix ui bug
 - style: defult point tag
  
## 0.0.17
 - fix: tag cache

## 0.0.11
 - optimize
 - fix: set initstate in load function

## 0.0.10
 - fix: change tag.state.visible defaultValue to undefined
 - fix(ui): fix ui anime
  
## 0.0.9
 - change globalConfig initialState

## 0.0.8
 - bug fix

## 0.0.6
 - feat: 新的插件：PanoTagPlugin 
