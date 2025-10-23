# Gotify 推送工具 - Chrome 插件

[View in English](README.md)

一个用于向 Gotify 服务器发送推送消息的 Chrome 浏览器插件。

## 开发与构建

项目已添加基本的开发工具配置：`eslint`、`prettier`、`esbuild` 和 CI 工作流。使用方法（在项目根目录执行）：

```bash
# 安装依赖
npm ci

# 本地构建（生产）
npm run build

# 本地构建（开发，包含 sourcemap）
npm run build:dev

# 代码风格与静态检查
npm run lint
npm run lint:fix
npm run format
```

## 功能特性

- 配置 Gotify 服务器地址和多个 Token
- 快速发送自定义标题和内容的推送消息
- 支持选择不同的 Token 进行消息发送
- 支持中英文切换

## 安装方法

1. 在 Chrome 浏览器中访问 `chrome://extensions/`
2. 开启右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择本项目的根目录

## 使用说明

1. 点击插件图标，然后点击「设置」按钮配置 Gotify 服务器地址和 Token。
2. 在设置页面，你可以通过下拉菜单选择界面语言（英文或简体中文）。
3. 返回主界面，选择要使用的 Token
4. 输入推送标题和内容
5. 点击「发送」按钮完成推送

## 技术说明

- 使用 Chrome 扩展 Manifest V3
- 使用 Chrome Storage API 存储配置
- 使用 Fetch API 发送 HTTP 请求

## 开发调试

在开发过程中，可以使用 Chrome 开发者工具查看扩展的日志和错误信息。对于弹出窗口的调试，可以右键点击弹出窗口并选择「检查」。

403 错误处理
检查 GOTIFY_SERVER_CORS_ALLOWORIGINS 配置项是否正确设置。
docker GOTIFY_SERVER_CORS_ALLOWORIGINS = - ".\*"
