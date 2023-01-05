# CHANGELOG
## 2.3.8

- 1. feat(PanoTagPlugin): tag dom 添加 `data-content-type={tag.contentType}` 用来标识标签的 contentType 

## 2.3.6

- 1. feat(CruisePlugin): load 添加参数 moveToFirstPanoDuration，可指定移动到漫游初始点时的速度。

## 2.3.5

- 1. feat(model-view-plugin): 支持动态 enable 和 disable。

## 2.3.4

- 1. fix(pano-tag-plugin): 修复空格不展示。

## 2.3.2

- 1. feat(pano-measure-plugin): 支持传入自定义UI文案

## 2.2.7

- 1. fix(build:libs): 修复 libs 构建产物异常的问题。

## 2.2.6

- 1. feat(entry-door): 入户门插件支持配置 name。

## 2.2.1

- 1. fix(floorplan-radar): 修复在 panoArrived 之后 loadData 时初始展示楼层只会是一层的问题。

## 2.2.0

- 1. refactor: 开发/构建流程优化

## 2.1.1

- 1. feat: PointHelper 和 PointDomHelper 直径改成 0.4m。

## 2.1.0

- 1. feat: CSS3DRenderPlugin API 支持插件 3.0 标准
- 2. refactor: CSS3DRenderPlugin 重构，提供不依赖 Five 的内部类
- 3. fix: CSS3DRenderPlugin 修复在部分情况下，CSS3DDom 最终渲染结果与传入的四个点的朝向可能不一致的情况
- 4. feat: ModelTVVideoPlugin 视频点击行为由 「静音播放/不静音播放」 改为 「播放/暂停」，且在暂停时显示播放按钮
- 5. feat: 导出 Util

## 2.0.4

- 1. 构建工具优化

## 2.0.3

- 1. fix: ModelRoomLabelPlugin 修复在 Five 模型切换动画过程中改变楼层，没有触发刷新的问题。
- 2. fix: ModelRoomLabelPlugin 修复切换楼层时，没有触发立即刷新的问题。
- 3. refactor: ModelViewPlugin 支持配置锁定视角和点位。

## 2.0.2

- 1. feat: FloorplanPlugin 支持动态修改房间面积展示和房间标尺展示
- 2. feat: PanoRulerPlugin 支持动态修改距离展示
- 3. feat: PanoMeasurePlugin 支持动态修改距离展示
- 4. refactor: FloorplanPlugin 允许 `setState` 传入 `Partial<Config>` 而不是 `Config`

## 2.0.0

- 1. fix: `ModelViewPlugin` 修复模型部分材质不展示的问题
- 2. feat: CruisePlugin 漫游插件
- 3. feat: GuideLinePlugin 地面路线引导插件

## 2.0.0-alpha.57

- 1.fix: PanoRulerPlugin 部分数据情况下 element 未 display: none 问题。

## 2.0.0-alpha.56

- 1.fix: PanoRulerPlugin off 全量事件监听。

## 2.0.0-alpha.55

- 1.fix: PanoRulerPlugin 异常 Dom。
- 2.51 ～ 54 版本为测试阶段，主版本无异常变更。

## 2.0.0-alpha.50

- 1.feat: MapviewFloorplanPlugin: 添加大空间户型图插件

## 2.0.0-alpha.49

- 1.fix: ModelTVVideoPlugin 多点位视频播放。

## 2.0.0-alpha.43

- 1.fix: PanoCompassPluginData 导出

## 2.0.0-alpha.42

- 1.fix: PanoCompassPlugin 未完全 dispose 导致切换 VR 重新加载数据出现异常。
- 2.fix: PanoCompassPlugin 在 five 切换全景与模型，入户门与分间指向错位的问题。

## 2.0.0-alpha.41

- 1.feat: 40 版本漏发。

## 2.0.0-alpha.40

- 1.refactor: PanoMeasurePlugin: 添加 View Mode，支持用户仅预览和点击高亮。

## 2.0.0-alpha.39

- 1.feat: 更新 ItemLabelPlugin 策略，仅在全景模态下展示。

## 2.0.0-alpha.38

- 1.feat: 新增 PanoRulerProPlugin。

## 2.0.0-alpha.37

- 1.feat: 参考 plugins/src/floorplan/CHANGELOG.md v1.0.1

## 2.0.0-alpha.36

- 1.style: PanoMeasurePlugin pc 端 UI 优化
- 2.style: PanoMeasurePlugin 准心优化，支持是否展示法向量和小球颜色可配置
- 3.fix: 修复 ResizeObserver 使用。
- 4.refactor: 参考 plugins/src/floorplan/CHANGELOG.md v1.0.0

## 2.0.0-beta.36

- 1.refactor: 户型图相关插件改造，详情参考 floorplan/CHANGELOGE.md。

## 2.0.0-alpha.35

- 1.style: PanoSpatialTagPlugin 标签样式兼容, 标签阴影背景自适应；
- 2.feat: PanoSpatialTagPlugin 开放可见距离配置参数，此功能不保证最佳 UI 效果）;
- 3.refactor: PanoSpatialTagPlugin 更新中心点位置及事件监听。

## 2.0.0-alpha.34

- 1.feat: 新增 PaintBrush 组件，此版本为实验版，请谨慎使用。

## 2.0.0-alpha.33

- 1.fix: Floorplan Plugins Compass & ModelChassisCompassPlugin 修复对 north_rad 为 0 的处理
- 2.fix: panospatialtagplugin 兼容 nextjs 出现的 text 样式问题

## 2.0.0-alpha.32

- 1.feat: PanoRulerPlugin 修改标尺隐藏策略，线长小于 0.3m 隐藏；
- 2.fix: TopViewFloorplanPlugin & ModelFloorplanPlugin wrapper pointer-events: none。

## 2.0.0-alpha.31

- 1.fix: 修复 ?? 语法在 svelte 中不编译的问题。

## 2.0.0-alpha.30

- 1.feat: PanoMeasurePlugin 新增移动端 UI 交互模式
- 2.feat: PanoMeasurePlugin 点线、标签气泡、删除按钮、三维坐标系 UI 交互优化
- 3.feat: PanoMeasurePlugin 优化放大镜功能，支持可拖拽，新增放大镜开放参数
- 4.fix: TopviewFloorplanPlugin 兼容全局 text-align 使用
- 5.fix: 新增 ItemLabelPlugin 内测版

## 2.0.0-alpha.29

- 1.chore: 删除 react 依赖.

## 2.0.0-alpha.28

- 1.chore: 优化打包输出路径.

## 2.0.0-alpha.27

- 1.feat: PanoSpatialTagPlugin 兼容 bvh 为 false 模式.

## 2.0.0-alpha.26

- 1.fix: ModelRoomLabelPlugin - 修复渲染区域大小改变时，标签位置没有更新
- 2.pref: ModelRoomLabelPlugin - 优化渲染逻辑

## 2.0.0-alpha.25

- 1.refactor: 恢复发版

## 2.0.0-alpha.24

- 1.feat: PanoRulerPlugin 支持数据 reload。

## 2.0.0-alpha.23

- 1.fix: 修复 PanoFloorplanRadarPlugin reload 数据时报错
- 2.fix: 修复 PanoFloorplanRadarPlugin reload 户型图数据后雷达图标位置没有适配

## 2.0.0-alpha.22

- 1.fix: 修复 PanoMeasurePlugin disable 状态下仍有背景色占位问题。

## 2.0.0-alpha.21

- 1.fix: 修复 PanoMeasurePlugin 仅初始化 UI 面板仍占位为题。

## 2.0.0-alpha.20

- 1.fix: 修复 PanoMeasurePlugin hide 时 UI 面板仍占位为题。

## 2.0.0-alpha.19

- 1.fix: 修复在模型中切换全部楼层，切换回户型图，展示的是上一次展示时的楼层；
- 2.fix: 修复户型图界面切换楼层时，图片与 SVG 渲染有时间差导致闪烁的问题；
- 3.feat: TopviewFloorplanPlugin 插件支持放大缩小；
- 4.feat: ModelFloorplanPlugin 插件，autoShowEnable 和 hoverEnable 能同时支持；
- 5.chore: 设置 tsconfig.json importsNotUsedAsValues 为 error，在引用类型时，必须显示写为 import type。

## 2.0.0-alpha.18

- 1.fix: 修复 PanoMeasurePlugin 使用时 hammerjs 报错问题。

## 2.0.0-alpha.17

- 1.fix: 修复构建输出 px2rem 失效问题。

## 2.0.0-alpha.16

- 1.fix: 修复 z-index 问题；
- 2.fix: 修复 ModelItemLabelPlugin 事件监听问题。

## 2.0.0-alpha.15

- 1.refactor: 优化 ModelItemLabelPlugin 在调用 five.setState() 时的动画显示。

## 2.0.0-alpha.14

- 1.feat: 新增 ModelTVVideoPlugin 插件；
- 2.fix: 修复 ModelItemLabelPlugin disable & enable 方法逻辑；
- 3.refactor: 增加 ModelItemLabelPlugin 类型导出。

## 2.0.0-alpha.13

- 1.chore: 修改 tsconfig.json target 配置项为 es6。

## 2.0.0-alpha.12

- 1.feat: 新增 ModelItemLabelPlugin

## 2.0.0-alpha.11

- 1.fix: 修复 ModelRoomLabelPlugin 未监听多楼层切换 rerender 问题。
- 2.feat: ModelFloorplanPlugin & TopviewFloorplanPlugin 新增 `northDesc?: string` 配置项，支持用户修改指北针名称。

## 2.0.0-alpha.10

- 1.feat: 新增空间三维标签插件 PanoSpatialTagPlugin
- 2.feat: 新增轻量 ejs 渲染模板函数 shared-utils/tinyEJSrender.js

## 2.0.0-alpha.9

- 1.refactor: 增加插件独立 js 输出及对 svelte 的编译。

## 2.0.0-alpha.8

- 1.fix: 修复 ModelViewPlugin 实景 VR 模型不居中问题；
- 2.fix: 修复 ModelRoomLabelPlugin fov 更新未 rerender 问题；
- 2.fix: 修复 ModelRoomLabelPlugin enable 判断问题；
- 4.fix: 修改 ModelFloorplanPlugin 在全景态满足户型图的俯仰角时会自动切换户型图问题。

## 2.0.0-alpha.7

- 1.fix: PanoCompassPlugin 向下兼容；
- 2.feat: 新增 PC 全景测量插件：PanoMeasurePlugin；
- 3.docs: 修改 README.md；

## 2.0.0-alpha.6

- 1.fix: 标尺插件 PanoRulerPlugin 所有标尺仅展示一次问题；
- 2.fix: TopviewFloorplanPlugin && ModelFloorplanPlugin 插件小雷达位置显示不正确问题；
- 3.feat: 为 TopviewFloorplanPlugin && ModelFloorplanPlugin 插件新增线框图吸附位置配置选项。
  - 可选地板、天花板、模型中心，默认吸附选项为模型中心。

## 2.0.0-alpha.5

1.修复全景指南针插件 PanoCompassPlugin 默认导出 name

## 2.0.0-alpha.4

1.新增全景标尺插件 PanoRulerPlugin

## 2.0.0-alpha.3

1.新增全景指南针插件 PanoCompassPlugin
