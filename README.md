# 就地开饭 WokLocal

就地开饭，让留子在世界各地吃上饭。

面向刚到海外、几乎零烹饪基础的中国留学生的本地化厨房知识库。每道菜除了标准做法，还会按地区展示当地超市能买到的替代食材、购买位置和味道差异。当前提供英国和美国落地资料，更多地区由社区持续补充。

线上地址：[SunRichardSKT.github.io/WokLocal](https://SunRichardSKT.github.io/WokLocal/)

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
- `data/guides/*.yaml`：地区通用建议（在页面中与落地清单合并展示）。
- `data/starter-packs/*.yaml`：落地清单、超市介绍与注意事项。

菜谱通过 `ingredient_id` 引用替代库，通过 `equipment.required_ids` 引用厨具库。普通本地食材可以直接在菜谱里写 `name_zh` 和 `name_en`；调料、香料或海外难找的食材应优先进入共享替代库。

## 当前页面

- `/recipes`：菜谱列表和类型筛选。
- `/today`：按时间、预算、厨具和购物场景推荐今天做什么。
- `/starter`：落地清单与注意事项。
- `/ingredients`：食材对照表，支持中文、英文和别名搜索。
- `/equipment`：厨具购买建议。
- `/saved`：浏览器本地收藏和最近看过的菜谱。
- `/pantry`：按现有食材推荐菜谱。
- `/shopping-list`：按菜谱生成本地购物清单。
- `/contribute`：无需编程基础的可视化投稿助手，支持自动保存、食材库搜索、图片压缩、GitHub 和邮件投稿。

当前英国数据包含食材替代、厨具建议、超市与落地清单，以及中餐、融合菜和本地食材改造菜；美国已提供独立落地清单与超市建议。

## 不会代码也能投稿

打开网站的“我要投稿”，选择菜谱、食材、厨具或落地经验，按普通表单填写即可。页面会自动生成技术字段并把草稿保存在当前浏览器；菜谱食材可以直接从现有食材库搜索选择。

- 有 GitHub 账号：检查通过后点击“用 GitHub 提交”。
- 没有 GitHub 账号：点击“使用邮件投稿”，将已复制的内容粘贴到邮件正文。
- 图片：优先使用本人拍摄、公共领域或明确授权的图片，提交时需确认使用权并附上来源。

详细步骤见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## GitHub Pages 部署

仓库已包含 `.github/workflows/pages.yml`。推送到 `main` 后，GitHub Actions 会：

1. 安装依赖。
2. 校验 YAML 数据。
3. 构建 Next.js 静态站点。
4. 发布 `out/` 到 GitHub Pages。

如果仓库是项目页，构建会自动使用 `/<仓库名>` 作为 base path；如果仓库名是 `<用户名>.github.io`，则使用根路径。

## 维护者提交前检查

```bash
npm run validate:data
npm run typecheck
npm run build
```
