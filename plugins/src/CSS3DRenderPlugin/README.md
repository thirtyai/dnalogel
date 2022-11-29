# 如何修复错误 ‘Can not find a valid element to insert behindFiveElement.’

## 原因
  1. 您可能使用到了 `CSS3DRenderPlugin` 插件的 `behind` 模式，但是插件在尽最大可能的情况下，没有找到一个合适的容器元素。
  2. 您可能使用到了 `Object3DHelperPlugin` 插件的 `scaleHelper` 功能，但是插件在尽最大可能的情况下，没有找到一个合适的容器元素。

## 容器元素是什么？
  * `CSS3DRenderPlugin` 插件的 `behind` 模式，需要一个容器元素，这个容器元素为five canvas的父元素或者父元素的父元素。
  * 容器元素需要位于five canvas dom的后方，且中间没有任何其他不透明元素的遮挡（即移除掉five canvas后能立即看到此元素）

## 合适的容器元素有哪些要求？
  * `five canvas dom`的 `position` 属性为 `relative` 或 `absolute` 或 `fixed` 。
  * `five canvas dom`的背景色透明。
  * 或者`five canvas dom`的父元素满足以上要求。
  * 容器元素为满足以上条件的元素的父元素，即`five.getElement().parentElement` 或 `five.getElement().parentElement.parentElement`。

## 如何修复？
  * 方法1(推荐)： 修改five canvas dom或者其父元素，即：
  ```typescript
  five.getElement().parentElement.style.position = 'relative'
  five.getElement().parentElement.style.background = 'transparent'
  // 或
  five.getElement().style.position = 'relative'
  five.getElement().style.background = 'transparent'
  ```
  * 方法2：
  ```typescript
  import { CSS3DRender } from '@realsee/dnalogel'
  CSS3DRender.setBehindModeContainer(container) // container 为满足要求的容器元素。需要自行创建符合要求的容器元素，并且需要在报错的代码之前执行
  ```
  