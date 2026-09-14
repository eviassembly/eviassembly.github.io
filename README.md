# EviAssembly

纯静态网站：HTML、CSS、原生 JavaScript。无需 npm、构建命令、数据库或 API Key。

## 首次部署到 GitHub Pages

1. 登录有权管理 `eviassembly` 的 GitHub 账号。
2. 在该账号（或组织）下创建 Public 仓库，名称必须为 `eviassembly.github.io`。如果已存在，直接使用现有仓库，并先检查现有内容。
3. 解压发布包，通过仓库的 **Add file → Upload files** 上传包内的文件和文件夹至 `main` 分支根目录。不要直接上传 ZIP，也不要把整个外层文件夹作为一层目录上传。`index.html` 必须直接位于仓库根目录。
4. 保留根目录的空文件 `.nojekyll`，避免 Jekyll 处理静态资源。在 macOS Finder 中按 Command + Shift + . 显示隐藏文件；若网页上传时遗漏，可通过 **Add file → Create new file** 新建 `.nojekyll`，文件内容可写一行说明。
5. 打开 **Settings → Pages → Build and deployment**：
   - Source：**Deploy from a branch**
   - Branch：**main**
   - Folder：**/(root)**
   - 点击 **Save**。
6. 无需填写 Custom domain，也无需 DNS 设置。使用默认 github.io 地址即可。
7. 等待部署完成（通常数分钟，官方说明可长达 10 分钟），通过 Pages 中的 **Visit site** 访问 https://eviassembly.github.io/ 。若失败，查看 **Actions** 中的 Pages 部署日志。

本包选择分支发布，因此不需要添加自定义 GitHub Actions 工作流。
若看不到 Settings / Pages，需要仓库管理员或维护者权限。

## 上传后的目录

```text
index.html
about.html
styles.css
app.js
samples.js
contact-config.js
favicon.svg
.nojekyll
README.md
fonts/
examples/
```

## 本地预览

在该目录运行：

```sh
python3 -m http.server 8000
```

然后访问 http://localhost:8000/ 。不要直接双击 index.html；本网站使用 JavaScript ES modules，需要通过 HTTP 预览。

## 内容维护

- 页面文字：`index.html`
- 样式：`styles.css`
- 示例数据：`samples.js` 与 `examples/`
- 公开联系邮箱：`contact-config.js`；修改邮箱时同步修改 `index.html` 中的邮箱文本和 mailto 链接，以保留无 JavaScript 时的联系入口。
- 当前邮箱：`eviassembly@gmail.com`。网站通过邮件客户端联系，不需要配置邮件服务器。
- 更新后提交到 `main`，Pages 将自动重新部署。
- 字体授权文件保留在 `fonts/` 中。

## 发布前检查结果（2026-09-14）

- 本地 HTML 资源引用、页面锚点、CSS 字体路径与 JavaScript 模块引用检查通过。
- 4 个静态 JSON 文件可正常解析。
- 浏览器中首页、对象切换、关系切换与拆解视图运行正常，检查时未记录到控制台错误或警告。
- 原始 18 个文件保持不变，仅补充本 README。
- 本地检查不代表已上传或上线；GitHub 仓库、权限与 Pages 设置需在账号内完成。

官方文档：
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
