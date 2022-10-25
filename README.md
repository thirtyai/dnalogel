# Start

## 插件开发

1、安装依赖包
```bash
pnpm i
```

2、启动项目，开始开发
```bash
npm run dev
```

## 插件发包

1、填写更新日历
路径：/plugins/CHANGELOG.md

2、更改 package.json 版本号

3、插件打包
```bash
npm run build:plugins
```

4、发包
确认更新日志、版本号、打包无误后进行发包
```bash
npm publish
```

## 示例发布

** 示例链接同时应用于文档中心，请确保无误后再发布 **
```bash
npm run deploy
```

进入 https://realsee.js.org/dnalogel/ 查看是否发布成功。

## 测试/上线部署

developer 启动命令：
```bash
npm run test
```
此命令会自动构建 examples 静态资源，并 push 到 online 分支，测试人员拉取 online 分支，进行如下操作：

```bash
#进入静态资源目录
cd online

#开启http服务，以下启动服务的方式可被替换
python -m SimpleHTTPServer
```

访问链接: http://localhost:8000/dnalogel/
