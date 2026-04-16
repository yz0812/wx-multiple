# 微信多开

一个基于 Tauri 2 + React + Vite 的 Windows 桌面工具，用于选择微信安装目录并按指定数量启动多个微信实例。

## 功能

- 自动扫描常见微信安装目录
- 支持手动选择微信目录
- 支持直接输入 `Weixin.exe` 完整路径
- 支持 1 到 10 个实例批量启动

## 技术栈

- Tauri 2
- React 19
- Vite 8
- TypeScript 6
- Rust

## 开发环境

- Windows 11
- Node.js
- Rust

## 安装依赖

```bash
npm install
```

## 本地开发

```bash
npm run tauri dev
```

## 前端构建

```bash
npm run build
```

## 桌面应用构建

```bash
npm run tauri build
```

## 项目结构

```text
src/                  前端页面与组件
src-tauri/            Tauri Rust 代码与桌面配置
src-tauri/src/lib.rs  后端命令入口
src/App.tsx           主界面
```

## GitHub Actions

仓库包含 Windows 自动构建工作流：

- `push` 到 `main` / `master`
- `pull_request` 到 `main` / `master`
- 手动触发 `workflow_dispatch`

工作流会在 GitHub Actions 中执行：

1. 安装 Node.js 依赖
2. 安装 Rust 工具链
3. 执行前端构建
4. 执行 Tauri Windows 构建
5. 上传构建产物
