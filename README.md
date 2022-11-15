# Start

## 插件开发

1、安装依赖包

```bash
pnpm i
```

2、启动项目，开始开发

```bash
pnpm run dev
```

## 插件发包

1、填写更新日历
路径：/plugins/CHANGELOG.md

2、更改 package.json 版本号

```bash
pnpm version 
```

3、插件打包

```bash
pnpm run build
```

4、发包
确认更新日志、版本号、打包无误后进行发包

```bash
pnpm publish
```

## 示例发布

### 示例链接同时应用于文档中心，请确保无误后再发布

```bash
pnpm run deploy
```

进入 <https://realsee.js.org/dnalogel/> 查看是否发布成功。
