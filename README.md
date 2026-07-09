# 就地开饭 WokLocal

面向刚到海外、几乎零烹饪基础的中国留学生的本地化厨房知识库。每道菜除了标准做法，还会按地区展示当地超市能买到的替代食材、购买位置和味道差异。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- YAML 本地数据
- Zod 数据校验
- GitHub Pages 静态部署

## 本地开发

```bash
npm install
npm run validate:data
npm run dev
```

可选环境变量：

```bash
NEXT_PUBLIC_SITE_URL=https://你的用户名.github.io/仓库名
NEXT_PUBLIC_REPOSITORY_URL=https://github.com/你的用户名/仓库名
```

构建静态站点：

```bash
npm run build
```

构建结果会输出到 `out/`，GitHub Actions 会把它发布到 GitHub Pages。

## 数据目录

- `data/recipes/*.yaml`：菜谱数据。
- `data/substitutions/*.yaml`：共享食材替代库。
- `data/equipment/*.yaml`：厨具库。
- `data/guides/*.yaml`：地区落地快速入门宝典。

菜谱通过 `ingredient_id` 引用替代库，通过 `equipment.required_ids` 引用厨具库。普通本地食材可以直接在菜谱里写 `name_zh` 和 `name_en`；调料、香料或海外难找的食材应优先进入共享替代库。

## 当前页面

- `/recipes`：菜谱列表和类型筛选。
- `/today`：按时间、预算、厨具和购物场景推荐今天做什么。
- `/starter`：英国新生第一周采购清单。
- `/ingredients`：食材对照表，支持中文、英文和别名搜索。
- `/equipment`：厨具购买建议。
- `/guides`：地区落地快速入门宝典。
- `/contribute`：可视化生成 YAML 和 GitHub Issue 内容。

当前英国样板数据包含食材替代、厨具建议、落地宝典，以及中餐和本地食材改造菜。

## GitHub Pages 部署

仓库已包含 `.github/workflows/pages.yml`。推送到 `main` 后，GitHub Actions 会：

1. 安装依赖。
2. 校验 YAML 数据。
3. 构建 Next.js 静态站点。
4. 发布 `out/` 到 GitHub Pages。

如果仓库是项目页，构建会自动使用 `/<仓库名>` 作为 base path；如果仓库名是 `<用户名>.github.io`，则使用根路径。

## 贡献

请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。提交前至少运行：

```bash
npm run validate:data
npm run build
```
