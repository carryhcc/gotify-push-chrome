# Gotify推送工具 - Chrome插件

一个用于向Gotify服务器发送推送消息的Chrome浏览器插件。

## 功能特性

- 配置Gotify服务器地址和多个Token
- 快速发送自定义标题和内容的推送消息
- 支持选择不同的Token进行消息发送

## 安装方法

1. 在Chrome浏览器中访问 `chrome://extensions/`
2. 开启右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择本项目的根目录

## 使用说明

1. 点击插件图标，然后点击「设置」按钮配置Gotify服务器地址和Token
2. 返回主界面，选择要使用的Token
3. 输入推送标题和内容
4. 点击「发送」按钮完成推送

## 排查403错误

如果您遇到403 Forbidden错误，可以按照以下步骤查看详细的错误信息：

1. 在Chrome浏览器中，打开插件的弹出窗口
2. 右键点击弹出窗口内部，选择「检查」
3. 在打开的开发者工具中切换到「Console」(控制台)标签页
4. 尝试发送消息，您将看到详细的请求信息和错误响应
5. 查看控制台中的日志，特别注意：
   - 请求URL是否正确
   - X-Gotify-Key头部是否包含了您配置的Token
   - 服务器返回的详细错误信息

## 常见问题

### 403错误可能的原因：

- Token不正确或已过期
- 服务器地址配置错误
- Gotify服务器需要特定的权限或配置
- 网络连接问题或防火墙限制

### 如何修复：

1. 确认您的Token正确无误
2. 验证服务器地址是否可达
3. 检查Gotify服务器的访问权限设置
4. 尝试使用不同的网络环境

### 遇到CORS策略阻止问题怎么办？

这是由于浏览器的同源策略限制导致的。解决方案：
1. 修改Gotify服务器配置，添加CORS支持：
   - 在Gotify的配置文件（config.yml）中添加：
     ```yaml
     server:
       cors:
         allowOrigins: ["*"]
     ```
2. 或者使用Nginx等反向代理，为Gotify添加CORS响应头：
   ```
   add_header Access-Control-Allow-Origin *;
   add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
   add_header Access-Control-Allow-Headers 'Content-Type, X-Gotify-Key';
   ```
3. 确保您使用的是localhost或127.0.0.1作为服务器地址
4. 如果是HTTPS，确保证书有效

## 技术说明

- 使用Chrome扩展Manifest V3
- 使用Chrome Storage API存储配置
- 使用Fetch API发送HTTP请求

## 开发调试

在开发过程中，可以使用Chrome开发者工具查看扩展的日志和错误信息。对于弹出窗口的调试，可以右键点击弹出窗口并选择「检查」。