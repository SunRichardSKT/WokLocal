# 项目提示词：就地开饭 WokLocal

> 使用方式：将下面全部内容复制粘贴给 Claude Code / Cursor 等 AI 编程工具，作为项目初始化的第一条指令。可以按需删减 MVP 范围。

---

## 项目背景与目标

我要做一个开源的中餐食谱网站，目标用户是**刚到海外、几乎零烹饪基础的中国留学生**。

这个项目和普通菜谱网站最大的区别，也是它唯一的核心卖点是：**每道菜除了标准做法，还会针对用户所在地区，给出当地超市能买到的替代食材/调料，并说明替代后的效果差异**。因为留学生最大的痛点不是"不会做"，而是"看着菜谱却找不到食材、对不上超市货架"。

请帮我从 0 搭建这个项目。请先搭好架构和数据模型，再实现页面，不要一上来就写大量 UI 而忽略数据结构，因为这个项目的价值核心在数据结构，不在视觉。

## 技术选型

- 框架：Next.js（App Router），静态导出优先，方便部署到 Vercel / GitHub Pages
- 样式：Tailwind CSS
- 数据存储：本地 Markdown + YAML frontmatter（或 JSON，你可以推荐更适合的方案），不使用数据库，方便社区通过 GitHub PR 贡献内容
- 部署目标：Vercel 免费额度
- 移动端优先（学生大概率用手机看），要能正常在手机浏览器上使用

## 核心数据结构（请先实现这两类 schema）

### 1）食材替代库（`data/substitutions/*.yaml`，被所有菜谱共享引用，不要在菜谱里重复写）

```yaml
ingredient_id: shengchou       # 生抽
name_zh: 生抽
name_en: Light soy sauce
category: 调料
regions:
  north_america:
    substitute: "普通生抽/低盐酱油（如 Kikkoman Less Sodium）"
    where_to_buy: "普通超市调料区；亚超（H-Mart / 99 Ranch）有原装生抽"
    usage_note: "普通酱油偏咸，用量建议减半"
    similarity: 4   # 1-5，跟原版的接近程度
  uk:
    substitute: "..."
    where_to_buy: "Tesco/Sainsbury's 或亚超"
    usage_note: "..."
    similarity: 3
  germany:
    substitute: "..."
    where_to_buy: "..."
    similarity: 3
```

### 2）菜谱数据（`data/recipes/*.yaml` 或 `.mdx`）

```yaml
id: xihongshi-chaodan
name:
  zh: 西红柿炒鸡蛋
  pinyin: Xihongshi Chao Dan
  en: Tomato and Egg Stir-fry
difficulty: 1        # 1-5
time_minutes: 15
servings: 2
cuisine: 家常菜
tags: [快手, 新手友好, 素食可选]
equipment:
  required: [炒锅或平底锅]
  substitutes_if_missing: "没有炒锅可以用任何深一点的平底锅代替"

base_ingredients:
  - ingredient_id: xihongshi   # 西红柿，本地食材直接写，不一定需要替代库
    amount: "2个"
  - ingredient_id: jidan       # 鸡蛋
    amount: "3个"
  - ingredient_id: shengchou   # 引用上面的替代库条目
    amount: "1汤匙"
  - ingredient_id: baitang
    amount: "半茶匙"
    optional: false

steps:
  - order: 1
    instruction: "西红柿切块；鸡蛋打散，加一小撮盐"
    tip: "喜欢汤汁多的话西红柿可以先划十字焯水去皮"
  - order: 2
    instruction: "热锅冷油，倒入蛋液炒至半凝固盛出"

common_mistakes:
  - "鸡蛋炒太久变老变硬"
  - "西红柿没炒出汁就急着出锅"
```

请你根据这两个 schema，设计合理的 TypeScript 类型定义，并写一个校验脚本（用 zod 或类似方案），保证社区贡献的菜谱数据格式不会出错。

## 页面清单（MVP）

1. **首页**：项目简介 + 精选/热门菜谱入口 + "选择你所在地区"的入口（地区选择应该是全局状态，影响后续所有菜谱页展示的替代方案）
2. **菜谱列表页**：可按难度、耗时、菜系、标签筛选；卡片展示菜名+难度+耗时
3. **菜谱详情页**：
   - 标准食材清单
   - 根据用户当前选择的地区，自动把对应食材替换/标注为"本地化替代建议"（如果用户没选地区，默认展示标准版 + 提示"选择你的地区查看本地化建议"）
   - 图文步骤
   - 新手踩坑提示
4. **关于/贡献指南页**：说明如何提交新菜谱、如何为某个地区补充替代食材信息，附 PR 模板和 Issue 模板要求

## 地区切换器行为

- 支持地区：先做 `uk`（英国），预留 `north_america`、`europe`、`australia`、`japan_korea` 等的扩展位
- 用户选择的地区应该持久化（本地存储即可，不需要登录系统），下次访问记住选择
- 找不到对应地区替代信息时，清晰提示"暂无该地区的本地化建议，欢迎在 GitHub 提交"

## 内容与社区

- 请生成 `CONTRIBUTING.md`，说明贡献菜谱/贡献地区替代信息的流程和数据格式要求
- 请生成 GitHub Issue 模板：一个用于"提交新菜谱"，一个用于"补充某地区的食材替代信息"
- README 需要包含项目定位、本地开发方式、数据格式说明

## MVP 交付范围（这次先做这些，不要一次性铺开）

- 用 3~5 道菜谱（西红柿炒鸡蛋、蛋炒饭、宫保鸡丁）+ 对应的北美地区替代数据跑通整个流程
- 先实现首页、菜谱列表页、菜谱详情页（含地区切换器）
- 贡献指南和 Issue 模板可以先给出简单版本

## 视觉风格建议

家常、温暖、接地气的感觉，不要做得像高级餐厅菜谱网站；照片/插图先用占位图即可，重点先把数据结构和交互跑通。

---

请先跟我确认数据结构设计和技术选型没有问题，再开始搭建项目骨架。
