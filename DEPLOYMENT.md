# 双平台部署

本站使用同一个 GitHub 仓库同时发布到两个静态托管平台：

- GitHub Pages：项目现有的公开主站。
- Tencent EdgeOne Makers：面向中国大陆访问的备用站。

两个平台都监听 `main` 分支。以后只需要正常推送一次代码，两个站点会分别自动构建和更新，不需要维护两份内容。

## GitHub Pages

仓库中的 `.github/workflows/pages.yml` 会在每次推送到 `main` 后执行：

1. 安装依赖。
2. 校验 YAML 数据。
3. 构建带 `/WokLocal` 基础路径的静态站点。
4. 将 `out/` 发布到 GitHub Pages。

主站地址：<https://SunRichardSKT.github.io/WokLocal/>

## EdgeOne Makers

仓库根目录的 `edgeone.json` 已设置：

- 安装命令：`npm ci`
- 构建命令：`npm run build`
- 输出目录：`out`
- Node.js：`20.18.0`

首次接入需要仓库所有者完成一次授权：

1. 打开下方“一键部署”链接并登录腾讯云。
2. 授权 EdgeOne 读取 GitHub 仓库 `SunRichardSKT/WokLocal`。
3. 确认生产分支为 `main`。
4. 检查构建命令为 `npm run build`，输出目录为 `out`。
5. 点击创建并等待第一次部署完成。

[使用 EdgeOne Makers 部署 WokLocal](https://console.cloud.tencent.com/edgeone/pages/new?repository-url=https%3A%2F%2Fgithub.com%2FSunRichardSKT%2FWokLocal&project-name=woklocal&build-command=npm%20run%20build&install-command=npm%20ci&output-directory=out)

完成 Git 仓库关联后，EdgeOne 会自动监听 `main` 分支的 push，不需要额外的 API Token 或 GitHub Secret。部署成功后，请把 EdgeOne 分配的生产域名补充到本文件和 README。

## 发布前检查

```bash
npm run validate:data
npm run typecheck
npm run build
```

运行全页面 UI 检查时，先启动本地服务：

```bash
npm run dev
```

然后在另一个终端运行：

```bash
npm run audit:ui
```

脚本会检查全部固定页面和全部菜谱详情，并循环覆盖 320、375、768、1440px 四种视口。也可以通过 `AUDIT_BASE_URL` 检查其他部署地址；如未自动找到浏览器，可设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE`。
