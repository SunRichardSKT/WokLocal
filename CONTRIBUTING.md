# 上传指南

感谢你帮忙把留学生能真正买到、做得出的厨房经验补齐：菜谱、食材替代、厨具建议和落地清单都欢迎投稿。

## 新增菜谱

1. 在 `data/recipes/` 新增一个 `.yaml` 文件，文件名建议使用拼音或英文短横线。
2. 填写 `id`、名称、难度、耗时、份量、菜系、标签、厨具、食材、步骤和踩坑提示。
3. 如果食材已经在 `data/substitutions/` 中存在，只写 `ingredient_id` 和 `amount`。
4. 如果是普通食材，且不需要本地替代，可以在菜谱里直接写 `name_zh`、`name_en` 和 `amount`。

## 新增地区替代信息

1. 找到对应的 `data/substitutions/*.yaml`。
2. 在 `regions` 下新增或补充地区键，例如 `uk`、`north_america`、`europe`。
3. 每个地区至少包含：
   - `substitute`
   - `where_to_buy`
   - `similarity`
4. 建议补充 `usage_note`，说明替代后的味道、咸度、用量或烹饪差异。

## 新增厨具建议

1. 在 `data/equipment/` 新增一个 `.yaml` 文件。
2. 填写 `equipment_id`、中英文名、分类、预算档位、是否必买、使用场景和地区购买建议。
3. 菜谱如需引用该厨具，在 `equipment.required_ids` 中添加对应 ID。

## 新增落地清单与注意事项

1. 不会写 YAML 时，优先访问 `/contribute`，选择“落地清单”。
2. “主要内容”可以自由写 Markdown，不需要拆成固定字段。
3. 内容应围绕“落地后先买什么、去哪买、怎么避免踩坑”。
4. 有 GitHub 账号可以复制 Issue 内容提交；没有账号可以发邮件到 `guyanrichard@qq.com`。

## 校验

提交前运行：

```bash
npm run validate:data
npm run build
```

校验会检查 YAML 语法、必填字段、难度范围、相似度范围、重复 ID，以及菜谱引用的食材是否能正确显示。

不会写代码也可以先访问 `/contribute`，用表单生成 YAML、复制 Issue 内容或下载 YAML 文件。

## 内容原则

- 优先写给零基础新手看。
- 购买建议尽量具体到超市类型或货架区域。
- 替代食材不要只写“可替代”，要说明替代后的差异。
- 不复制商业菜谱原文；请用自己的语言描述做法。
- 视频链接只放外链，不复制或搬运视频内容。
