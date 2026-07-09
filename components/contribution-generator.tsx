"use client";

import { useEffect, useMemo, useState } from "react";
import { Clipboard, Download, ExternalLink, Plus, Trash2 } from "lucide-react";
import { scenarioDefinitions } from "@/lib/recommendations";
import type { RecommendationScenario } from "@/lib/schemas";

type ContributionKind = "recipe" | "substitution" | "equipment";
type RecipeType = "chinese" | "fusion" | "local_adapted";
type BudgetLevel = "low" | "medium" | "high";

type RecipeIngredientDraft = {
  ingredientId: string;
  nameZh: string;
  nameEn: string;
  amount: string;
  optional: boolean;
};

type RecipeStepDraft = {
  instruction: string;
  tip: string;
};

type GeneratedContribution = {
  targetPath: string;
  fileName: string;
  yaml: string;
  issueTitle: string;
  issueBody: string;
  validationErrors: string[];
};

const tabs: Array<{ id: ContributionKind; label: string }> = [
  { id: "recipe", label: "新增菜谱" },
  { id: "substitution", label: "新增食材替代" },
  { id: "equipment", label: "新增厨具建议" }
];

const regionOptions = ["uk", "north_america", "europe", "australia", "japan_korea"];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function quote(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function splitList(value: string) {
  return value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function yamlList(values: string[]) {
  return `[${values.map(quote).join(", ")}]`;
}

function isValidId(value: string) {
  return /^[a-z0-9-]+$/.test(value.trim());
}

function validateUrl(value: string) {
  return !value.trim() || /^https?:\/\/\S+$/i.test(value.trim());
}

function deriveIssueBaseUrl() {
  if (typeof window === "undefined") return "";

  const configured = process.env.NEXT_PUBLIC_REPOSITORY_URL;
  if (configured) return `${configured.replace(/\/$/, "")}/issues/new`;

  const host = window.location.hostname;
  const firstPath = window.location.pathname.split("/").filter(Boolean)[0];
  if (host.endsWith(".github.io") && firstPath) {
    const owner = host.replace(".github.io", "");
    return `https://github.com/${owner}/${firstPath}/issues/new`;
  }

  return "";
}

function buildIssueUrl(title: string, body: string, labels: string[]) {
  const base = deriveIssueBaseUrl();
  if (!base) return "";

  const params = new URLSearchParams({ title, body, labels: labels.join(",") });
  return `${base}?${params.toString()}`;
}

function TextInput({
  label,
  value,
  onChange,
  hint,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm text-ink-300">
      {label}
      <input className="control" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {hint ? <span className="text-xs text-ink-500">{hint}</span> : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  hint
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <label className="grid gap-1 text-sm text-ink-300">
      {label}
      <textarea className="control min-h-24" value={value} onChange={(event) => onChange(event.target.value)} />
      {hint ? <span className="text-xs text-ink-500">{hint}</span> : null}
    </label>
  );
}

export function ContributionGenerator() {
  const [kind, setKind] = useState<ContributionKind>("recipe");
  const [copied, setCopied] = useState(false);
  const [copiedIssue, setCopiedIssue] = useState(false);

  const [recipe, setRecipe] = useState({
    id: "tomato-cheese-rice",
    nameZh: "番茄芝士焖饭",
    pinyin: "Fanqie Zhishi Menfan",
    nameEn: "Tomato Cheese Rice",
    description: "用普通英国超市食材做一顿低门槛热饭。",
    difficulty: "2",
    timeMinutes: "20",
    servings: "1",
    cuisine: "留学生厨房菜",
    recipeType: "fusion" as RecipeType,
    budgetLevel: "low" as BudgetLevel,
    tags: "一锅出, 融合菜, 低预算",
    equipmentIds: "nonstick-pan, spatula",
    equipmentRequired: "不粘锅, 锅铲",
    equipmentSubstitute: "没有不粘锅时用深一点的平底锅。",
    videoUrl: "",
    mistakes: "盐不要一次放太多。\n收汁时注意别糊底。"
  });
  const [recipeScenarios, setRecipeScenarios] = useState<RecommendationScenario[]>(["low_budget", "tesco_friendly"]);
  const [ingredients, setIngredients] = useState<RecipeIngredientDraft[]>([
    { ingredientId: "xihongshi", nameZh: "番茄", nameEn: "Tomato", amount: "1 个", optional: false },
    { ingredientId: "cheddar", nameZh: "切达奶酪", nameEn: "Cheddar cheese", amount: "一小把", optional: false }
  ]);
  const [steps, setSteps] = useState<RecipeStepDraft[]>([
    { instruction: "把主要食材切好。", tip: "新手先把所有食材放在手边。" },
    { instruction: "按顺序下锅，调味后出锅。", tip: "" }
  ]);

  const [substitution, setSubstitution] = useState({
    id: "cheddar",
    nameZh: "切达奶酪",
    nameEn: "Cheddar cheese",
    pinyin: "qieda-nailao",
    category: "奶制品",
    aliasesZh: "芝士, 奶酪",
    aliasesEn: "Cheddar, Cheese",
    aliasesPinyin: "zhishi, nailao",
    keywords: "切达奶酪, cheddar, cheese, 芝士",
    uses: "焖饭, 三明治, 卷饼",
    region: "uk",
    substitute: "Mature cheddar 或 mild cheddar",
    where: "Tesco、Sainsbury's、Lidl、Aldi 奶酪冷藏区",
    note: "mature cheddar 味道更重，mild cheddar 更温和。",
    similarity: "5"
  });

  const [equipment, setEquipment] = useState({
    id: "air-fryer",
    nameZh: "空气炸锅",
    nameEn: "Air fryer",
    category: "optional_upgrade",
    budgetLevel: "medium" as BudgetLevel,
    essential: false,
    uses: "烤鸡翅, 复热炸物, 烤蔬菜",
    substitutes: "烤箱, 平底锅小火煎",
    region: "uk",
    where: "Argos、Amazon UK、Currys、大型超市厨具区",
    priceRange: "£35-£80",
    note: "宿舍先确认是否允许使用高功率电器。"
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      setSubstitution((current) => ({ ...current, nameZh: query, id: slugify(query) }));
      setKind("substitution");
    }
  }, []);

  const generated = useMemo<GeneratedContribution>(() => {
    const errors: string[] = [];
    let yaml = "";
    let targetPath = "";
    let issueTitle = "";

    if (kind === "recipe") {
      const id = slugify(recipe.id || recipe.nameEn);
      const tags = splitList(recipe.tags);
      const equipmentIds = splitList(recipe.equipmentIds);
      const equipmentRequired = splitList(recipe.equipmentRequired);
      const mistakes = recipe.mistakes
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean);
      const numericDifficulty = Number(recipe.difficulty);
      const numericTime = Number(recipe.timeMinutes);
      const numericServings = Number(recipe.servings);
      const usableIngredients = ingredients.filter((item) => item.ingredientId.trim() && item.amount.trim());
      const usableSteps = steps.filter((item) => item.instruction.trim());

      if (!id || !isValidId(id)) errors.push("菜谱 ID 只能使用小写字母、数字和短横线。");
      if (!recipe.nameZh.trim()) errors.push("菜谱中文名不能为空。");
      if (!recipe.pinyin.trim()) errors.push("菜谱拼音不能为空。");
      if (!recipe.nameEn.trim()) errors.push("菜谱英文名不能为空。");
      if (!recipe.description.trim()) errors.push("菜谱简介不能为空。");
      if (!Number.isInteger(numericDifficulty) || numericDifficulty < 1 || numericDifficulty > 5) errors.push("难度必须是 1-5 的整数。");
      if (!Number.isInteger(numericTime) || numericTime <= 0) errors.push("耗时必须是正整数。");
      if (!Number.isInteger(numericServings) || numericServings <= 0) errors.push("份量必须是正整数。");
      if (tags.length === 0) errors.push("至少填写一个标签。");
      if (recipeScenarios.length === 0) errors.push("至少选择一个推荐场景。");
      if (equipmentRequired.length === 0) errors.push("至少填写一个所需厨具名称。");
      if (usableIngredients.length === 0) errors.push("至少填写一个食材。");
      if (usableSteps.length === 0) errors.push("至少填写一个步骤。");
      if (mistakes.length === 0) errors.push("至少填写一个新手踩坑提示。");
      if (!validateUrl(recipe.videoUrl)) errors.push("视频链接必须是 http 或 https URL。");

      targetPath = `data/recipes/${id}.yaml`;
      issueTitle = `新菜谱：${recipe.nameZh}`;
      const videoBlock = recipe.videoUrl.trim()
        ? `video_links:
  - platform: other
    title: ${quote(`观看 ${recipe.nameZh} 参考视频`)}
    url: ${quote(recipe.videoUrl.trim())}`
        : "video_links: []";
      const ingredientBlock = usableIngredients
        .map((item) => {
          const lines = [`  - ingredient_id: ${slugify(item.ingredientId) || item.ingredientId}`, `    amount: ${quote(item.amount)}`];
          if (item.nameZh.trim()) lines.splice(1, 0, `    name_zh: ${quote(item.nameZh)}`);
          if (item.nameEn.trim()) lines.splice(item.nameZh.trim() ? 2 : 1, 0, `    name_en: ${quote(item.nameEn)}`);
          if (item.optional) lines.push("    optional: true");
          return lines.join("\n");
        })
        .join("\n");
      const stepBlock = usableSteps
        .map((step, index) => {
          const lines = [`  - order: ${index + 1}`, `    instruction: ${quote(step.instruction)}`];
          if (step.tip.trim()) lines.push(`    tip: ${quote(step.tip)}`);
          return lines.join("\n");
        })
        .join("\n");

      yaml = `id: ${id}
name:
  zh: ${quote(recipe.nameZh)}
  pinyin: ${quote(recipe.pinyin)}
  en: ${quote(recipe.nameEn)}
description: ${quote(recipe.description)}
difficulty: ${numericDifficulty || 2}
time_minutes: ${numericTime || 20}
servings: ${numericServings || 1}
cuisine: ${recipe.cuisine}
recipe_type: ${recipe.recipeType}
budget_level: ${recipe.budgetLevel}
scenarios: [${recipeScenarios.join(", ")}]
tags: ${yamlList(tags)}
equipment:
  required_ids: [${equipmentIds.join(", ")}]
  required: ${yamlList(equipmentRequired)}
  substitutes_if_missing: ${quote(recipe.equipmentSubstitute)}
base_ingredients:
${ingredientBlock}
steps:
${stepBlock}
${videoBlock}
common_mistakes:
${mistakes.map((mistake) => `  - ${quote(mistake)}`).join("\n")}
`;
    } else if (kind === "substitution") {
      const id = slugify(substitution.id || substitution.nameEn);
      const similarity = Number(substitution.similarity);
      if (!id || !isValidId(id)) errors.push("食材 ID 只能使用小写字母、数字和短横线。");
      if (!substitution.nameZh.trim()) errors.push("食材中文名不能为空。");
      if (!substitution.nameEn.trim()) errors.push("食材英文名不能为空。");
      if (!substitution.pinyin.trim()) errors.push("拼音不能为空。");
      if (!substitution.category.trim()) errors.push("分类不能为空。");
      if (splitList(substitution.keywords).length === 0) errors.push("搜索关键词不能为空。");
      if (!substitution.substitute.trim()) errors.push("替代方案不能为空。");
      if (!substitution.where.trim()) errors.push("购买地点不能为空。");
      if (!Number.isInteger(similarity) || similarity < 1 || similarity > 5) errors.push("相似度必须是 1-5 的整数。");

      targetPath = `data/substitutions/${id}.yaml`;
      issueTitle = `地区替代：${substitution.nameZh}`;
      yaml = `ingredient_id: ${id}
name_zh: ${quote(substitution.nameZh)}
name_en: ${quote(substitution.nameEn)}
pinyin: ${quote(substitution.pinyin)}
category: ${substitution.category}
aliases_zh: ${yamlList(splitList(substitution.aliasesZh))}
aliases_en: ${yamlList(splitList(substitution.aliasesEn))}
aliases_pinyin: ${yamlList(splitList(substitution.aliasesPinyin))}
search_keywords: ${yamlList(splitList(substitution.keywords))}
common_uses: ${yamlList(splitList(substitution.uses))}
regions:
  ${substitution.region}:
    substitute: ${quote(substitution.substitute)}
    where_to_buy: ${quote(substitution.where)}
    usage_note: ${quote(substitution.note)}
    similarity: ${similarity || 4}
`;
    } else {
      const id = slugify(equipment.id || equipment.nameEn);
      if (!id || !isValidId(id)) errors.push("厨具 ID 只能使用小写字母、数字和短横线。");
      if (!equipment.nameZh.trim()) errors.push("厨具中文名不能为空。");
      if (!equipment.nameEn.trim()) errors.push("厨具英文名不能为空。");
      if (splitList(equipment.uses).length === 0) errors.push("至少填写一个使用场景。");
      if (!equipment.where.trim()) errors.push("购买地点不能为空。");
      if (!equipment.priceRange.trim()) errors.push("价格区间不能为空。");

      targetPath = `data/equipment/${id}.yaml`;
      issueTitle = `厨具建议：${equipment.nameZh}`;
      yaml = `equipment_id: ${id}
name_zh: ${quote(equipment.nameZh)}
name_en: ${quote(equipment.nameEn)}
category: ${equipment.category}
budget_level: ${equipment.budgetLevel}
is_essential: ${equipment.essential}
use_cases: ${yamlList(splitList(equipment.uses))}
substitutes_if_missing: ${yamlList(splitList(equipment.substitutes))}
regions:
  ${equipment.region}:
    where_to_buy: ${quote(equipment.where)}
    price_range: ${quote(equipment.priceRange)}
    notes: ${quote(equipment.note)}
`;
    }

    const issueBody = `目标文件：\`${targetPath}\`\n\n请审阅下面的 YAML：\n\n\`\`\`yaml\n${yaml}\`\`\``;
    return { targetPath, fileName: targetPath.split("/").pop() ?? "contribution.yaml", yaml, issueTitle, issueBody, validationErrors: errors };
  }, [equipment, ingredients, kind, recipe, recipeScenarios, steps, substitution]);

  const issueUrl =
    generated.validationErrors.length === 0
      ? buildIssueUrl(generated.issueTitle, generated.issueBody, [kind === "recipe" ? "recipe" : kind === "substitution" ? "substitution" : "equipment"])
      : "";

  async function copyYaml() {
    await navigator.clipboard.writeText(generated.yaml);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function copyIssueBody() {
    await navigator.clipboard.writeText(generated.issueBody);
    setCopiedIssue(true);
    window.setTimeout(() => setCopiedIssue(false), 1400);
  }

  function downloadYaml() {
    const blob = new Blob([generated.yaml], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = generated.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="surface rounded-md p-2">
        <div className="grid gap-2 sm:grid-cols-3">
          {tabs.map((tab) => (
            <button
              className={tab.id === kind ? "rounded-md bg-scallion px-3 py-2 text-sm font-semibold text-ink-950" : "rounded-md px-3 py-2 text-sm text-ink-300 hover:bg-white/[0.06]"}
              key={tab.id}
              onClick={() => setKind(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(28rem,0.9fr)]">
        <section className="surface rounded-md p-4">
          <h2 className="text-lg font-semibold text-ink-100">可视化编辑</h2>
          <div className="mt-4 grid gap-4">
            {kind === "recipe" ? (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <TextInput label="中文名" value={recipe.nameZh} onChange={(value) => setRecipe({ ...recipe, nameZh: value })} />
                  <TextInput label="拼音" value={recipe.pinyin} onChange={(value) => setRecipe({ ...recipe, pinyin: value })} />
                  <TextInput label="英文名" value={recipe.nameEn} onChange={(value) => setRecipe({ ...recipe, nameEn: value })} />
                </div>
                <TextInput label="菜谱 ID" value={recipe.id} onChange={(value) => setRecipe({ ...recipe, id: value })} hint="用于文件名和 URL，只用小写字母、数字和短横线。" />
                <TextArea label="简介" value={recipe.description} onChange={(value) => setRecipe({ ...recipe, description: value })} />
                <div className="grid gap-3 md:grid-cols-4">
                  <TextInput label="难度 1-5" value={recipe.difficulty} onChange={(value) => setRecipe({ ...recipe, difficulty: value })} />
                  <TextInput label="耗时/分钟" value={recipe.timeMinutes} onChange={(value) => setRecipe({ ...recipe, timeMinutes: value })} />
                  <TextInput label="份量" value={recipe.servings} onChange={(value) => setRecipe({ ...recipe, servings: value })} />
                  <TextInput label="菜系" value={recipe.cuisine} onChange={(value) => setRecipe({ ...recipe, cuisine: value })} />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="grid gap-1 text-sm text-ink-300">
                    类型
                    <select className="control" value={recipe.recipeType} onChange={(event) => setRecipe({ ...recipe, recipeType: event.target.value as RecipeType })}>
                      <option value="chinese">中餐</option>
                      <option value="fusion">融合菜</option>
                      <option value="local_adapted">本地改造</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm text-ink-300">
                    预算
                    <select className="control" value={recipe.budgetLevel} onChange={(event) => setRecipe({ ...recipe, budgetLevel: event.target.value as BudgetLevel })}>
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>
                  </label>
                  <TextInput label="标签，逗号分隔" value={recipe.tags} onChange={(value) => setRecipe({ ...recipe, tags: value })} />
                </div>
                <section className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-sm font-medium text-ink-100">推荐场景</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {scenarioDefinitions.map((scenario) => (
                      <label className="flex items-center gap-2 text-sm text-ink-300" key={scenario.id}>
                        <input
                          className="size-4 accent-scallion"
                          type="checkbox"
                          checked={recipeScenarios.includes(scenario.id)}
                          onChange={(event) =>
                            setRecipeScenarios((current) =>
                              event.target.checked ? [...current, scenario.id] : current.filter((item) => item !== scenario.id)
                            )
                          }
                        />
                        {scenario.label}
                      </label>
                    ))}
                  </div>
                </section>
                <div className="grid gap-3 md:grid-cols-2">
                  <TextInput label="厨具 ID，逗号分隔" value={recipe.equipmentIds} onChange={(value) => setRecipe({ ...recipe, equipmentIds: value })} />
                  <TextInput label="厨具名称，逗号分隔" value={recipe.equipmentRequired} onChange={(value) => setRecipe({ ...recipe, equipmentRequired: value })} />
                </div>
                <TextInput label="缺少厨具时怎么替代" value={recipe.equipmentSubstitute} onChange={(value) => setRecipe({ ...recipe, equipmentSubstitute: value })} />

                <section className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink-100">食材</p>
                    <button
                      className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-ink-300 hover:bg-white/[0.06]"
                      onClick={() => setIngredients([...ingredients, { ingredientId: "", nameZh: "", nameEn: "", amount: "", optional: false }])}
                      type="button"
                    >
                      <Plus size={14} aria-hidden="true" />
                      添加
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {ingredients.map((ingredient, index) => (
                      <div className="grid gap-2 rounded-md border border-white/10 p-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]" key={index}>
                        <input className="control" value={ingredient.ingredientId} onChange={(event) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, ingredientId: event.target.value } : item)))} placeholder="ingredient_id" />
                        <input className="control" value={ingredient.nameZh} onChange={(event) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, nameZh: event.target.value } : item)))} placeholder="中文名，可选" />
                        <input className="control" value={ingredient.nameEn} onChange={(event) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, nameEn: event.target.value } : item)))} placeholder="英文名，可选" />
                        <input className="control" value={ingredient.amount} onChange={(event) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, amount: event.target.value } : item)))} placeholder="用量" />
                        <button className="flex size-10 items-center justify-center rounded-md border border-white/10 text-ink-300 hover:bg-white/[0.06]" onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))} type="button" aria-label="删除食材">
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink-100">步骤</p>
                    <button className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-ink-300 hover:bg-white/[0.06]" onClick={() => setSteps([...steps, { instruction: "", tip: "" }])} type="button">
                      <Plus size={14} aria-hidden="true" />
                      添加
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {steps.map((step, index) => (
                      <div className="rounded-md border border-white/10 p-3" key={index}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-ink-300">步骤 {index + 1}</p>
                          <button className="flex size-8 items-center justify-center rounded-md border border-white/10 text-ink-300 hover:bg-white/[0.06]" onClick={() => setSteps(steps.filter((_, i) => i !== index))} type="button" aria-label="删除步骤">
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                        <textarea className="control mt-2 min-h-20 w-full" value={step.instruction} onChange={(event) => setSteps(steps.map((item, i) => (i === index ? { ...item, instruction: event.target.value } : item)))} placeholder="步骤说明" />
                        <input className="control mt-2 w-full" value={step.tip} onChange={(event) => setSteps(steps.map((item, i) => (i === index ? { ...item, tip: event.target.value } : item)))} placeholder="新手提示，可选" />
                      </div>
                    ))}
                  </div>
                </section>
                <TextArea label="新手踩坑，每行一个" value={recipe.mistakes} onChange={(value) => setRecipe({ ...recipe, mistakes: value })} />
                <TextInput label="视频链接，可选" value={recipe.videoUrl} onChange={(value) => setRecipe({ ...recipe, videoUrl: value })} placeholder="https://..." />
              </>
            ) : kind === "substitution" ? (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <TextInput label="中文名" value={substitution.nameZh} onChange={(value) => setSubstitution({ ...substitution, nameZh: value })} />
                  <TextInput label="英文名" value={substitution.nameEn} onChange={(value) => setSubstitution({ ...substitution, nameEn: value })} />
                  <TextInput label="拼音" value={substitution.pinyin} onChange={(value) => setSubstitution({ ...substitution, pinyin: value })} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <TextInput label="食材 ID" value={substitution.id} onChange={(value) => setSubstitution({ ...substitution, id: value })} />
                  <TextInput label="分类" value={substitution.category} onChange={(value) => setSubstitution({ ...substitution, category: value })} />
                </div>
                <TextInput label="中文别名，逗号分隔" value={substitution.aliasesZh} onChange={(value) => setSubstitution({ ...substitution, aliasesZh: value })} />
                <TextInput label="英文别名，逗号分隔" value={substitution.aliasesEn} onChange={(value) => setSubstitution({ ...substitution, aliasesEn: value })} />
                <TextInput label="拼音别名，逗号分隔" value={substitution.aliasesPinyin} onChange={(value) => setSubstitution({ ...substitution, aliasesPinyin: value })} />
                <TextInput label="搜索关键词，逗号分隔" value={substitution.keywords} onChange={(value) => setSubstitution({ ...substitution, keywords: value })} />
                <TextInput label="常见用途，逗号分隔" value={substitution.uses} onChange={(value) => setSubstitution({ ...substitution, uses: value })} />
                <div className="grid gap-3 md:grid-cols-[10rem_1fr]">
                  <label className="grid gap-1 text-sm text-ink-300">
                    地区
                    <select className="control" value={substitution.region} onChange={(event) => setSubstitution({ ...substitution, region: event.target.value })}>
                      {regionOptions.map((region) => (
                        <option value={region} key={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TextInput label="替代方案" value={substitution.substitute} onChange={(value) => setSubstitution({ ...substitution, substitute: value })} />
                </div>
                <TextInput label="哪里买" value={substitution.where} onChange={(value) => setSubstitution({ ...substitution, where: value })} />
                <TextArea label="使用差异" value={substitution.note} onChange={(value) => setSubstitution({ ...substitution, note: value })} />
                <TextInput label="相似度 1-5" value={substitution.similarity} onChange={(value) => setSubstitution({ ...substitution, similarity: value })} />
              </>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <TextInput label="厨具 ID" value={equipment.id} onChange={(value) => setEquipment({ ...equipment, id: value })} />
                  <TextInput label="中文名" value={equipment.nameZh} onChange={(value) => setEquipment({ ...equipment, nameZh: value })} />
                  <TextInput label="英文名" value={equipment.nameEn} onChange={(value) => setEquipment({ ...equipment, nameEn: value })} />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="grid gap-1 text-sm text-ink-300">
                    分类
                    <select className="control" value={equipment.category} onChange={(event) => setEquipment({ ...equipment, category: event.target.value })}>
                      <option value="must_have">必买</option>
                      <option value="optional_upgrade">可选升级</option>
                      <option value="dorm_friendly">宿舍友好</option>
                      <option value="avoid_first">先别急着买</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm text-ink-300">
                    预算
                    <select className="control" value={equipment.budgetLevel} onChange={(event) => setEquipment({ ...equipment, budgetLevel: event.target.value as BudgetLevel })}>
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>
                  </label>
                  <label className="mt-6 flex items-center gap-2 text-sm text-ink-300">
                    <input className="size-4 accent-scallion" checked={equipment.essential} onChange={(event) => setEquipment({ ...equipment, essential: event.target.checked })} type="checkbox" />
                    是否必买
                  </label>
                </div>
                <TextInput label="使用场景，逗号分隔" value={equipment.uses} onChange={(value) => setEquipment({ ...equipment, uses: value })} />
                <TextInput label="没有时可替代，逗号分隔" value={equipment.substitutes} onChange={(value) => setEquipment({ ...equipment, substitutes: value })} />
                <div className="grid gap-3 md:grid-cols-[10rem_1fr_12rem]">
                  <label className="grid gap-1 text-sm text-ink-300">
                    地区
                    <select className="control" value={equipment.region} onChange={(event) => setEquipment({ ...equipment, region: event.target.value })}>
                      {regionOptions.map((region) => (
                        <option value={region} key={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TextInput label="哪里买" value={equipment.where} onChange={(value) => setEquipment({ ...equipment, where: value })} />
                  <TextInput label="价格区间" value={equipment.priceRange} onChange={(value) => setEquipment({ ...equipment, priceRange: value })} />
                </div>
                <TextArea label="购买建议" value={equipment.note} onChange={(value) => setEquipment({ ...equipment, note: value })} />
              </>
            )}
          </div>
        </section>

        <section className="surface rounded-md p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-ink-100">YAML 预览</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-scallion px-3 py-2 text-sm font-semibold text-ink-950 disabled:cursor-not-allowed disabled:opacity-45" disabled={generated.validationErrors.length > 0} onClick={copyYaml} type="button">
                <Clipboard size={16} aria-hidden="true" />
                {copied ? "已复制" : "复制 YAML"}
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-ink-100 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45" disabled={generated.validationErrors.length > 0} onClick={copyIssueBody} type="button">
                <Clipboard size={16} aria-hidden="true" />
                {copiedIssue ? "已复制 Issue" : "复制 Issue 内容"}
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-ink-100 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45" disabled={generated.validationErrors.length > 0} onClick={downloadYaml} type="button">
                <Download size={16} aria-hidden="true" />
                下载 YAML
              </button>
              {issueUrl ? (
                <a className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-ink-100 hover:bg-white/[0.06]" href={issueUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} aria-hidden="true" />
                  打开 Issue
                </a>
              ) : (
                <span className="rounded-md border border-white/10 px-3 py-2 text-sm text-ink-500">部署到 GitHub Pages 后可生成 Issue 链接</span>
              )}
            </div>
          </div>
          <p className="mt-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-ink-300">目标文件：{generated.targetPath}</p>
          {generated.validationErrors.length > 0 ? (
            <div className="mt-3 rounded-md border border-chili/25 bg-chili/[0.08] p-3 text-sm leading-6 text-ink-300">
              {generated.validationErrors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
          <pre className="mt-4 max-h-[44rem] overflow-auto rounded-md border border-white/10 bg-ink-950 p-4 text-xs leading-5 text-ink-300">
            <code>{generated.yaml}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}
