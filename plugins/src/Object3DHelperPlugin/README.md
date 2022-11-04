## 示例

```typescript
  const object3DHelper = Object3DHelperPlugin(five)
  const object = __yourobject__

  // 添加helper
  object3DHelper.addObject3DHelper(object)
  // 移除helper
  object3DHelper.removeObject3DHelper(object)
  // 获取贴片四个角的点（这个是实时的）
  const helper = object3DHelper.getObject3DHelper(object)
  const a = helper?.controllers.scaleController?.helperObject3D as any
  console.log(a.cornerPositions)
  /// 其他api按照3.0插件标准 show/hide/enable/disable/setState
```