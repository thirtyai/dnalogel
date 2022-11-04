# CHANGELOG.md
##  2.0.1
### Fix
 - 修复在传入的四个点的底边与XOZ平面不平行时的部分情况下，CSS3DDom最终渲染结果与传入的四个点的朝向可能不一致的情况


##  2.0.0
### Feature
- `CSS3DRenderPlugin` 重构
- 提供不依赖Five的类 `CSS3DRender`，API 与 插件API 基本一致
- `/utils/CSS3DObjectPlus` 继承 THREE 的 `CSS3DObject` 对象，解决`CSS3DObject`存在的兼容性bug
  
### Fix
- 修复CSS3DDom最终渲染结果与传入的四个点的朝向可能不一致的情况


## 1.0.1
### Change
- **`CSS3DRenderPlugin`** 
    - `disposeAll` 改为 `dispose`，旧的`disposeAll`将在之后的某个版本中移除
    - `dispose` 之后无法再进行执行任何方法
    - 插件不再依赖 `modelLoaded`
      - 之前的`等待five.modelLoaded后再使用此插件`的使用策略不会有任何问题。
      - 之后的新业务开发中，需要在调用侧添加`loaded`或`modelLoaded`之类的限制，如果不添加此类限制，可能会出现先出现此插件dom，后加载出five的情况。
      - `(mode: 'behind')`模式中，仍然依赖 `modelLoaded`：
        - 在之前的版本中，若 `five.model.loaded = false`，则会抛出一个错误
        - 在此版本中，若 `five.model.loaded = false`，则会等待`modelLoaded`后自动加载
- **`CSS3DRenderPlugin.create3DDomContainer`**
  - 参数
    - `config.dpr` 改为 `config.devicePixelRatio`，旧的`config.dpr`将在之后的某个版本中移除
- 移除`ResizeObserver` polyfill 支持
- 移除className: `__Dnalogel-plugin--CSS3DRenderPlugin`,改为带随机值的className

##### Feature
- **`CSS3DRenderPlugin`** 
  - 新增 `state` 属性
    ```typescript
    interface State {
      visible: boolean
      enabled: boolean
    }
    ```
  - 新增 `show: (options?: { userAction: boolean }) => void`，设置插件可见
  - 新增 `hide: (options?: { userAction: boolean }) => void`，设置插件隐藏
  - 新增 `enable: (options?: { userAction: boolean }) => void`，设置插件开启
  - 新增 `disable: (options?: { userAction: boolean }) => void`，设置插件关闭
  - 新增 `dispose: () => void`，销毁插件
  - 新增 `setState: (state: State, options?: { userAction: boolean }) => void`, 设置state
- **`CSS3DRenderPlugin.hooks`** 
  - 新增事件:
    - `stateChange: (state: State, prevState?: State; userAction: boolean) => void` state改变时触发
    - `dispose: (options?: { userAction?: boolean }) => void` 插件销毁时触发
    - `show: (options?: { userAction?: boolean }) => void` 插件可见时触发
    - `hide: (options?: { userAction?: boolean }) => void` 插件隐藏时触发
    - `enable: (options?: { userAction?: boolean }) => void` 插件开启时触发
    - `disable: (options?: { userAction?: boolean }) => void` 插件关闭时触发

- **`CSS3DRenderPlugin.create3DDomContainer`**
  - 参数
    - 新增 `config.pointerEvents`属性，用于设置 container 的 css 属性：`pointer-events` 的值，默认值为 `none`
  - 返回值
    - 新增`setVisible: (visible: boolean) => void`，设置`container`显隐
    - 新增`show: () => void`，同 `setVisible(true)`
    - 新增`hide: () => void`，同 `setVisible(false)`
    - 新增`setEnable: (enabled: boolean) => void`，添加/移除`container`
    - 新增`enable: () => void`，同 `setEnable(true)`
    - 新增`disable: () => void`，同 `setEnable(false)`


### Fix
  - 修复Safari浏览器及iphone设备中`ratio`小于`0.00216`时无法触发点击事件的bug
  - 修复使用 `create3DDomContainer` 第二次创建 `(mode: 'behind')` 的DOM时，DOM不可见的bug