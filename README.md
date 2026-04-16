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

仓库包含两个 Windows 工作流：

- `.github/workflows/build.yml`：分支构建
- `.github/workflows/release.yml`：tag 发布

### build.yml

触发条件：

- `push` 到 `main` / `master`
- `pull_request` 到 `main` / `master`
- 手动触发 `workflow_dispatch`

执行内容：

1. 安装 Node.js 依赖
2. 安装 Rust 工具链
3. 执行前端构建
4. 执行 Tauri Windows 构建
5. 上传构建产物

### release.yml

触发条件：

- 推送形如 `v0.1.0` 的 tag
- 示例：`git tag v0.1.0 && git push origin v0.1.0`

发布前会校验以下版本必须一致：

- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

发布产物包括：

- 便携版压缩包
- Tauri Windows 安装包
