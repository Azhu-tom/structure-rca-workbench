产品结构工程师问题分析助手 · 跨电脑开发

环境要求：安装 Node.js 20 LTS（npm 随 Node.js 安装）。

启动开发环境：
1. 在项目目录打开终端。
2. 执行：npm ci
3. 执行：npm run dev
4. 按终端显示的本地地址打开网站。

构建检查：npm run build

本项目使用 React 18、TypeScript、TDesign React 和 Vite。
备份包包含源码、Vite/TypeScript 配置及 package-lock.json。
node_modules 与 dist 已省略；在新电脑执行 npm ci 可还原依赖，npm run dev 可启动开发服务器。
