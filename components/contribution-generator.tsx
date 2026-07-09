"use client";

import { useEffect, useMemo, useState } from "react";
import { Clipboard, Download, ExternalLink, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { scenarioDefinitions } from "@/lib/recommendations";
import type { Equipment, RecommendationScenario, Substitution } from "@/lib/schemas";

type ContributionKind = "recipe" | "substitution" | "equipment";
type RecipeType = "chinese" | "fusion" | "local_adapted";
type BudgetLevel = "low" | "medium" | "high";
type IngredientSource = "library" | "custom";
type SectionKey = "basic" | "scenarios" | "equipment" | "ingredients" | "steps" | "mistakes" | "region";

type RecipeIngredientDraft = {
  source: IngredientSource;
  ingredientId: string;
  nameZh: string;
  nameEn: string;
  amount: string;
  optional: boolean;
  note: string;
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
  sectionErrors: Partial<Record<SectionKey, string[]>>;
  completedRequired: number;
  totalRequired: number;
};

type ContributionGeneratorProps = {
  ingredients: Substitution[];
  equipmentItems: Equipment[];
};

const tabs: Array<{ id: ContributionKind; label: string }> = [
  { id: "recipe", label: "新增菜谱" },
  { id: "substitution", label: "新增食材替代" },
  { id: "equipment", label: "新增厨具建议" }
];

const regionOptions = ["uk", "north_america", "europe", "australia", "japan_korea"];

const defaultRecipe = {
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
  equipmentSubstitute: "没有不粘锅时用深一点的平底锅。",
  videoUrl: "",
  mistakes: "盐不要一次放太多。\n收汁时注意别糊底。"
};

const defaultIngredients: RecipeIngredientDraft[] = [
  { source: "custom", ingredientId: "xihongshi", nameZh: "番茄", nameEn: "Tomato", amount: "1 个", optional: false, note: "" },
  { source: "custom", ingredientId: "cheddar", nameZh: "切达奶酪", nameEn: "Cheddar cheese", amount: "一小把", optional: false, note: "" }
];

const defaultSteps: RecipeStepDraft[] = [
  { instruction: "把主要食材切好。", tip: "新手先把所有食材放在手边。" },
  { instruction: "按顺序下锅，调味后出锅。", tip: "" }
];

const defaultSubstitution = {
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
};

const defaultEquipment = {
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
};

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

function firstNonEmpty(...values: string[]) {
  return values.map((value) => value.trim()).find(Boolean) ?? "";
}

function generatedId(...values: string[]) {
  return slugify(firstNonEmpty(...values));
}

function addError(sectionErrors: Partial<Record<SectionKey, string[]>>, section: SectionKey, message: string) {
  sectionErrors[section] = [...(sectionErrors[section] ?? []), message];
}

function countFilled(values: Array<boolean | string | number>) {
  return values.filter(Boolean).length;
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

function RequiredLabel({ label, required = true }: { label: string; required?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span>{label}</span>
      <span className={required ? "rounded-full bg-chili/[0.14] px-2 py-0.5 text-[11px] text-chili" : "rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-ink-500"}>
        {required ? "必填" : "选填"}
      </span>
    </span>
  );
}

function TextInput({
  label,
  value,
  onChange,
  required = true,
  hint,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm text-ink-300">
      <RequiredLabel label={label} required={required} />
      <input className="control" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {hint ? <span className="text-xs text-ink-500">{hint}</span> : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required = true,
  hint
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="grid gap-1 text-sm text-ink-300">
      <RequiredLabel label={label} required={required} />
      <textarea className="control min-h-24" value={value} onChange={(event) => onChange(event.target.value)} />
      {hint ? <span className="text-xs text-ink-500">{hint}</span> : null}
    </label>
  );
}

function SectionPanel({
  title,
  children,
  errors = [],
  optional = false
}: {
  title: string;
  children: React.ReactNode;
  errors?: string[];
  optional?: boolean;
}) {
  return (
    <details className="rounded-md border border-white/10 bg-white/[0.035] p-3" open>
      <summary className="cursor-pointer select-none text-sm font-semibold text-ink-100">
        <span className="inline-flex items-center gap-2">
          {title}
          <span className={optional ? "rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-ink-500" : "rounded-full bg-chili/[0.14] px-2 py-0.5 text-[11px] text-chili"}>
            {optional ? "含选填" : "含必填"}
          </span>
          {errors.length > 0 ? <span className="rounded-full bg-chili/[0.16] px-2 py-0.5 text-[11px] text-chili">{errors.length} 个问题</span> : null}
        </span>
      </summary>
      {errors.length > 0 ? (
        <div className="mt-3 rounded-md border border-chili/25 bg-chili/[0.08] p-3 text-sm leading-6 text-ink-300">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
      <div className="mt-4 grid gap-4">{children}</div>
    </details>
  );
}

function CompletionSummary({ generated }: { generated: GeneratedContribution }) {
  const complete = generated.validationErrors.length === 0;

  return (
    <section className={complete ? "rounded-md border border-scallion/25 bg-scallion/[0.08] p-3" : "rounded-md border border-chili/25 bg-chili/[0.08] p-3"}>
      <p className={complete ? "text-sm font-semibold text-scallion" : "text-sm font-semibold text-chili"}>
        {generated.completedRequired}/{generated.totalRequired} 必填项已完成
      </p>
      <p className="mt-1 text-sm leading-6 text-ink-300">
        {complete ? "格式看起来可以提交。复制 YAML 或 Issue 内容后发给维护者即可。" : `还有 ${generated.validationErrors.length} 个问题需要修正。`}
      </p>
    </section>
  );
}

function ingredientSearchText(item: Substitution) {
  return [
    item.ingredient_id,
    item.name_zh,
    item.name_en,
    item.pinyin ?? "",
    item.category,
    ...item.aliases_zh,
    ...item.aliases_en,
    ...item.aliases_pinyin,
    ...item.search_keywords,
    ...item.common_uses
  ]
    .join(" ")
    .toLowerCase();
}

function IngredientPicker({
  library,
  value,
  onSelect
}: {
  library: Substitution[];
  value: RecipeIngredientDraft;
  onSelect: (ingredient: RecipeIngredientDraft) => void;
}) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return library.slice(0, 8);
    return library.filter((item) => ingredientSearchText(item).includes(normalized)).slice(0, 8);
  }, [library, query]);

  return (
    <div className="grid gap-2">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} aria-hidden="true" />
        <input className="control w-full pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索已有食材：生抽 / soy sauce / shengchou" />
      </label>
      <div className="grid max-h-44 gap-2 overflow-auto rounded-md border border-white/10 bg-ink-950 p-2">
        {matches.map((item) => {
          const active = value.source === "library" && value.ingredientId === item.ingredient_id;
          return (
            <button
              className={active ? "rounded-md border border-scallion bg-scallion/[0.12] p-2 text-left" : "rounded-md border border-white/10 bg-white/[0.035] p-2 text-left hover:border-scallion/40"}
              key={item.ingredient_id}
              onClick={() =>
                onSelect({
                  ...value,
                  source: "library",
                  ingredientId: item.ingredient_id,
                  nameZh: item.name_zh,
                  nameEn: item.name_en
                })
              }
              type="button"
            >
              <span className="block text-sm font-medium text-ink-100">{item.name_zh}</span>
              <span className="mt-1 block text-xs text-ink-500">
                {item.ingredient_id} · {item.name_en}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ContributionGenerator({ ingredients: ingredientLibrary, equipmentItems }: ContributionGeneratorProps) {
  const [kind, setKind] = useState<ContributionKind>("recipe");
  const [copied, setCopied] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedIssue, setCopiedIssue] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [recipe, setRecipe] = useState(defaultRecipe);
  const [recipeScenarios, setRecipeScenarios] = useState<RecommendationScenario[]>(["low_budget", "tesco_friendly"]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(["nonstick-pan", "spatula"]);
  const [ingredients, setIngredients] = useState<RecipeIngredientDraft[]>(defaultIngredients);
  const [steps, setSteps] = useState<RecipeStepDraft[]>(defaultSteps);
  const [substitution, setSubstitution] = useState(defaultSubstitution);
  const [equipment, setEquipment] = useState(defaultEquipment);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      setSubstitution((current) => ({ ...current, nameZh: query, id: slugify(query) }));
      setKind("substitution");
    }
  }, []);

  function resetExample() {
    setRecipe(defaultRecipe);
    setRecipeScenarios(["low_budget", "tesco_friendly"]);
    setSelectedEquipmentIds(["nonstick-pan", "spatula"]);
    setIngredients(defaultIngredients);
    setSteps(defaultSteps);
    setSubstitution(defaultSubstitution);
    setEquipment(defaultEquipment);
  }

  const generated = useMemo<GeneratedContribution>(() => {
    const sectionErrors: Partial<Record<SectionKey, string[]>> = {};
    let yaml = "";
    let targetPath = "";
    let issueTitle = "";
    let completedRequired = 0;
    let totalRequired = 0;

    if (kind === "recipe") {
      const id = generatedId(recipe.pinyin, recipe.id, recipe.nameEn) || "new-recipe";
      const displayName = firstNonEmpty(recipe.nameZh, recipe.nameEn, "未命名菜谱");
      const recipePinyin = firstNonEmpty(recipe.pinyin, recipe.nameEn, recipe.nameZh, "未填写");
      const recipeNameEn = firstNonEmpty(recipe.nameEn, recipe.nameZh, recipe.pinyin, "Untitled recipe");
      const cuisine = firstNonEmpty(recipe.cuisine, "留学生厨房菜");
      const tags = splitList(recipe.tags);
      const selectedEquipment = equipmentItems.filter((item) => selectedEquipmentIds.includes(item.equipment_id));
      const equipmentNames = selectedEquipment.map((item) => item.name_zh);
      const mistakes = recipe.mistakes
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean);
      const numericDifficulty = Number(recipe.difficulty);
      const numericTime = Number(recipe.timeMinutes);
      const numericServings = Number(recipe.servings);
      const usableIngredients = ingredients.filter((item) => item.amount.trim() && (item.source === "library" ? item.ingredientId.trim() : item.nameZh.trim() || item.nameEn.trim()));
      const usableSteps = steps.filter((item) => item.instruction.trim());

      const requiredChecks = [
        recipe.nameZh.trim() || recipe.nameEn.trim(),
        recipe.description.trim(),
        Number.isInteger(numericDifficulty) && numericDifficulty >= 1 && numericDifficulty <= 5,
        Number.isInteger(numericTime) && numericTime > 0,
        Number.isInteger(numericServings) && numericServings > 0,
        recipe.recipeType,
        recipe.budgetLevel,
        tags.length > 0,
        recipeScenarios.length > 0,
        selectedEquipmentIds.length > 0,
        usableIngredients.length > 0,
        usableSteps.length > 0
      ];
      totalRequired = requiredChecks.length;
      completedRequired = countFilled(requiredChecks);

      if (!recipe.nameZh.trim() && !recipe.nameEn.trim()) addError(sectionErrors, "basic", "中文名和英文名至少填写一个。");
      if (!recipe.description.trim()) addError(sectionErrors, "basic", "简介不能为空。");
      if (!Number.isInteger(numericDifficulty) || numericDifficulty < 1 || numericDifficulty > 5) addError(sectionErrors, "basic", "难度必须是 1-5 的整数。");
      if (!Number.isInteger(numericTime) || numericTime <= 0) addError(sectionErrors, "basic", "耗时必须是正整数。");
      if (!Number.isInteger(numericServings) || numericServings <= 0) addError(sectionErrors, "basic", "份量必须是正整数。");
      if (tags.length === 0) addError(sectionErrors, "basic", "至少填写一个标签。");
      if (recipeScenarios.length === 0) addError(sectionErrors, "scenarios", "至少选择一个推荐场景。");
      if (selectedEquipmentIds.length === 0) addError(sectionErrors, "equipment", "至少选择一个厨具。");
      if (usableIngredients.length === 0) addError(sectionErrors, "ingredients", "至少填写一个食材。");
      ingredients.forEach((item, index) => {
        if (item.source === "custom" && item.amount.trim() && !item.nameZh.trim() && !item.nameEn.trim()) {
          addError(sectionErrors, "ingredients", `第 ${index + 1} 个临时食材需要填写中文名或英文名。`);
        }
      });
      if (usableSteps.length === 0) addError(sectionErrors, "steps", "至少填写一个步骤。");
      if (!validateUrl(recipe.videoUrl)) addError(sectionErrors, "basic", "视频链接必须是 http 或 https URL。");

      targetPath = `data/recipes/${id}.yaml`;
      issueTitle = `新菜谱：${displayName}`;
      const videoBlock = recipe.videoUrl.trim()
        ? `video_links:
  - platform: other
    title: ${quote(`观看 ${displayName} 参考视频`)}
    url: ${quote(recipe.videoUrl.trim())}`
        : "video_links: []";
      const ingredientBlock = usableIngredients
        .map((item, index) => {
          const ingredientId = item.source === "library" ? item.ingredientId : generatedId(item.nameEn, item.ingredientId, item.nameZh) || `custom-ingredient-${index + 1}`;
          const fallbackName = firstNonEmpty(item.nameZh, item.nameEn, `临时食材 ${index + 1}`);
          const lines = [`  - ingredient_id: ${ingredientId}`, `    amount: ${quote(item.amount)}`];
          if (item.source === "custom") {
            lines.splice(1, 0, `    name_zh: ${quote(firstNonEmpty(item.nameZh, item.nameEn, fallbackName))}`);
            lines.splice(2, 0, `    name_en: ${quote(firstNonEmpty(item.nameEn, item.nameZh, fallbackName))}`);
          }
          if (item.optional) lines.push("    optional: true");
          if (item.note.trim()) lines.push(`    note: ${quote(item.note)}`);
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
  zh: ${quote(firstNonEmpty(recipe.nameZh, recipe.nameEn, "未命名菜谱"))}
  pinyin: ${quote(recipePinyin)}
  en: ${quote(recipeNameEn)}
description: ${quote(recipe.description)}
difficulty: ${numericDifficulty || 2}
time_minutes: ${numericTime || 20}
servings: ${numericServings || 1}
cuisine: ${cuisine}
recipe_type: ${recipe.recipeType}
budget_level: ${recipe.budgetLevel}
scenarios: [${recipeScenarios.join(", ")}]
tags: ${yamlList(tags)}
equipment:
  required_ids: [${selectedEquipmentIds.join(", ")}]
  required: ${yamlList(equipmentNames)}
  substitutes_if_missing: ${quote(recipe.equipmentSubstitute)}
base_ingredients:
${ingredientBlock || "  - ingredient_id: example\n    amount: \"适量\""}
steps:
${stepBlock || "  - order: 1\n    instruction: \"写清楚第一步。\""}
${videoBlock}
common_mistakes: ${mistakes.length > 0 ? `\n${mistakes.map((mistake) => `  - ${quote(mistake)}`).join("\n")}` : "[]"}
`;
    } else if (kind === "substitution") {
      const id = generatedId(substitution.pinyin, substitution.nameEn, substitution.id) || "new-ingredient";
      const substitutionName = firstNonEmpty(substitution.nameZh, substitution.nameEn, "未命名食材");
      const substitutionNameZh = firstNonEmpty(substitution.nameZh, substitution.nameEn, "未命名食材");
      const substitutionNameEn = firstNonEmpty(substitution.nameEn, substitution.nameZh, "Unnamed ingredient");
      const category = firstNonEmpty(substitution.category, "未分类");
      const keywords = splitList(substitution.keywords);
      const searchKeywords = keywords.length > 0 ? keywords : [substitutionNameZh, substitutionNameEn].filter(Boolean);
      const similarity = Number(substitution.similarity);
      const hasRegionInfo = Boolean(substitution.substitute.trim() || substitution.where.trim() || substitution.note.trim());
      const regionBlock = hasRegionInfo
        ? `regions:
  ${substitution.region}:
    substitute: ${quote(firstNonEmpty(substitution.substitute, "待补充替代方案"))}
    where_to_buy: ${quote(firstNonEmpty(substitution.where, "待补充购买地点"))}
    usage_note: ${quote(substitution.note)}
    similarity: ${Number.isInteger(similarity) && similarity >= 1 && similarity <= 5 ? similarity : 4}`
        : "regions: {}";
      const requiredChecks = [
        substitution.nameZh.trim() || substitution.nameEn.trim()
      ];
      totalRequired = requiredChecks.length;
      completedRequired = countFilled(requiredChecks);

      if (!substitution.nameZh.trim() && !substitution.nameEn.trim()) addError(sectionErrors, "basic", "中文名和英文名至少填写一个。");
      if (substitution.similarity.trim() && (!Number.isInteger(similarity) || similarity < 1 || similarity > 5)) addError(sectionErrors, "region", "相似度如果填写，必须是 1-5 的整数。");

      targetPath = `data/substitutions/${id}.yaml`;
      issueTitle = `食材建议：${substitutionName}`;
      yaml = `ingredient_id: ${id}
name_zh: ${quote(substitutionNameZh)}
name_en: ${quote(substitutionNameEn)}
${substitution.pinyin.trim() ? `pinyin: ${quote(substitution.pinyin)}\n` : ""}category: ${category}
aliases_zh: ${yamlList(splitList(substitution.aliasesZh))}
aliases_en: ${yamlList(splitList(substitution.aliasesEn))}
aliases_pinyin: ${yamlList(splitList(substitution.aliasesPinyin))}
search_keywords: ${yamlList(searchKeywords)}
common_uses: ${yamlList(splitList(substitution.uses))}
${regionBlock}
`;
    } else {
      const id = generatedId(equipment.nameEn, equipment.id, equipment.nameZh) || "new-equipment";
      const equipmentName = firstNonEmpty(equipment.nameZh, equipment.nameEn, "未命名厨具");
      const equipmentNameZh = firstNonEmpty(equipment.nameZh, equipment.nameEn, "未命名厨具");
      const equipmentNameEn = firstNonEmpty(equipment.nameEn, equipment.nameZh, "Unnamed equipment");
      const useCases = splitList(equipment.uses);
      const hasEquipmentRegion = Boolean(equipment.where.trim() || equipment.priceRange.trim() || equipment.note.trim());
      const equipmentRegionBlock = hasEquipmentRegion
        ? `regions:
  ${equipment.region}:
    where_to_buy: ${quote(firstNonEmpty(equipment.where, "待补充购买地点"))}
    price_range: ${quote(firstNonEmpty(equipment.priceRange, "待补充价格"))}
    notes: ${quote(equipment.note)}`
        : "regions: {}";
      const requiredChecks = [
        equipment.nameZh.trim() || equipment.nameEn.trim()
      ];
      totalRequired = requiredChecks.length;
      completedRequired = countFilled(requiredChecks);

      if (!equipment.nameZh.trim() && !equipment.nameEn.trim()) addError(sectionErrors, "basic", "中文名和英文名至少填写一个。");

      targetPath = `data/equipment/${id}.yaml`;
      issueTitle = `厨具建议：${equipmentName}`;
      yaml = `equipment_id: ${id}
name_zh: ${quote(equipmentNameZh)}
name_en: ${quote(equipmentNameEn)}
category: ${equipment.category}
budget_level: ${equipment.budgetLevel}
is_essential: ${equipment.essential}
use_cases: ${yamlList(useCases.length > 0 ? useCases : [equipmentName])}
substitutes_if_missing: ${yamlList(splitList(equipment.substitutes))}
${equipmentRegionBlock}
`;
    }

    const validationErrors = Object.values(sectionErrors).flat();
    const issueBody = `目标文件：\`${targetPath}\`\n\n请审阅下面的 YAML：\n\n\`\`\`yaml\n${yaml}\`\`\``;
    return { targetPath, fileName: targetPath.split("/").pop() ?? "contribution.yaml", yaml, issueTitle, issueBody, validationErrors, sectionErrors, completedRequired, totalRequired };
  }, [equipment, equipmentItems, ingredients, kind, recipe, recipeScenarios, selectedEquipmentIds, steps, substitution]);

  const issueUrl =
    generated.validationErrors.length === 0
      ? buildIssueUrl(generated.issueTitle, generated.issueBody, [kind === "recipe" ? "recipe" : kind === "substitution" ? "substitution" : "equipment"])
      : "";

  async function copyYaml() {
    await navigator.clipboard.writeText(generated.yaml);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function copyPath() {
    await navigator.clipboard.writeText(generated.targetPath);
    setCopiedPath(true);
    window.setTimeout(() => setCopiedPath(false), 1400);
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

  const disabled = generated.validationErrors.length > 0;

  const previewActions = (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <button className="inline-flex items-center justify-center gap-2 rounded-md bg-scallion px-3 py-2 text-sm font-semibold text-ink-950 disabled:cursor-not-allowed disabled:opacity-45" disabled={disabled} onClick={copyYaml} type="button">
        <Clipboard size={16} aria-hidden="true" />
        {copied ? "已复制" : "复制 YAML"}
      </button>
      <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-ink-100 hover:bg-white/[0.06]" onClick={copyPath} type="button">
        <Clipboard size={16} aria-hidden="true" />
        {copiedPath ? "已复制路径" : "复制目标路径"}
      </button>
      <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-ink-100 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45" disabled={disabled} onClick={copyIssueBody} type="button">
        <Clipboard size={16} aria-hidden="true" />
        {copiedIssue ? "已复制 Issue" : "复制 Issue 内容"}
      </button>
      <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-ink-100 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45" disabled={disabled} onClick={downloadYaml} type="button">
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
  );

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

      <CompletionSummary generated={generated} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(28rem,0.9fr)]">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-100">可视化编辑</h2>
              <p className="mt-1 text-sm leading-6 text-ink-300">不会直接上传，只生成可复制内容和 Issue 链接。</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-ink-100 hover:bg-white/[0.06]" onClick={resetExample} type="button">
              <RotateCcw size={16} aria-hidden="true" />
              重置示例
            </button>
          </div>

          {kind === "recipe" ? (
            <>
              <SectionPanel title="基础信息" errors={generated.sectionErrors.basic}>
                <div className="grid gap-3 md:grid-cols-3">
                  <TextInput label="中文名" required={false} value={recipe.nameZh} onChange={(value) => setRecipe({ ...recipe, nameZh: value })} hint="中文名和英文名至少填一个。" />
                  <TextInput label="拼音" required={false} value={recipe.pinyin} onChange={(value) => setRecipe({ ...recipe, pinyin: value })} hint="选填；填写后会优先用于自动生成菜谱 ID。" />
                  <TextInput label="英文名" required={false} value={recipe.nameEn} onChange={(value) => setRecipe({ ...recipe, nameEn: value })} hint="选填；没有英文名时会用中文名兜底。" />
                </div>
                <TextInput label="自定义菜谱 ID" required={false} value={recipe.id} onChange={(value) => setRecipe({ ...recipe, id: value })} hint="选填；留空时优先用拼音自动生成文件名和 URL。" />
                <TextArea label="简介" value={recipe.description} onChange={(value) => setRecipe({ ...recipe, description: value })} />
                <div className="grid gap-3 md:grid-cols-4">
                  <TextInput label="难度 1-5" value={recipe.difficulty} onChange={(value) => setRecipe({ ...recipe, difficulty: value })} />
                  <TextInput label="耗时/分钟" value={recipe.timeMinutes} onChange={(value) => setRecipe({ ...recipe, timeMinutes: value })} />
                  <TextInput label="份量" value={recipe.servings} onChange={(value) => setRecipe({ ...recipe, servings: value })} />
                  <TextInput label="菜系" required={false} value={recipe.cuisine} onChange={(value) => setRecipe({ ...recipe, cuisine: value })} hint="选填；留空默认留学生厨房菜。" />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="grid gap-1 text-sm text-ink-300">
                    <RequiredLabel label="类型" />
                    <select className="control" value={recipe.recipeType} onChange={(event) => setRecipe({ ...recipe, recipeType: event.target.value as RecipeType })}>
                      <option value="chinese">中餐</option>
                      <option value="fusion">融合菜</option>
                      <option value="local_adapted">本地改造</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm text-ink-300">
                    <RequiredLabel label="预算" />
                    <select className="control" value={recipe.budgetLevel} onChange={(event) => setRecipe({ ...recipe, budgetLevel: event.target.value as BudgetLevel })}>
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>
                  </label>
                  <TextInput label="标签，逗号分隔" value={recipe.tags} onChange={(value) => setRecipe({ ...recipe, tags: value })} />
                </div>
                <TextInput label="视频链接" required={false} value={recipe.videoUrl} onChange={(value) => setRecipe({ ...recipe, videoUrl: value })} placeholder="https://..." />
              </SectionPanel>

              <SectionPanel title="推荐场景" errors={generated.sectionErrors.scenarios}>
                <div className="grid gap-2 sm:grid-cols-2">
                  {scenarioDefinitions.map((scenario) => (
                    <label className="flex items-center gap-2 text-sm text-ink-300" key={scenario.id}>
                      <input
                        className="size-4 accent-scallion"
                        type="checkbox"
                        checked={recipeScenarios.includes(scenario.id)}
                        onChange={(event) =>
                          setRecipeScenarios((current) => (event.target.checked ? [...current, scenario.id] : current.filter((item) => item !== scenario.id)))
                        }
                      />
                      {scenario.label}
                    </label>
                  ))}
                </div>
              </SectionPanel>

              <SectionPanel title="厨具" errors={generated.sectionErrors.equipment}>
                <div className="grid gap-2 sm:grid-cols-2">
                  {equipmentItems.map((item) => (
                    <label className="rounded-md border border-white/10 bg-white/[0.035] p-2 text-sm text-ink-300" key={item.equipment_id}>
                      <span className="flex items-start gap-2">
                        <input
                          className="mt-0.5 size-4 accent-scallion"
                          checked={selectedEquipmentIds.includes(item.equipment_id)}
                          onChange={(event) =>
                            setSelectedEquipmentIds((current) =>
                              event.target.checked ? [...current, item.equipment_id] : current.filter((id) => id !== item.equipment_id)
                            )
                          }
                          type="checkbox"
                        />
                        <span>
                          <span className="block font-medium text-ink-100">{item.name_zh}</span>
                          <span className="mt-0.5 block text-xs text-ink-500">{item.equipment_id}</span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <TextInput label="缺少厨具时怎么替代" required={false} value={recipe.equipmentSubstitute} onChange={(value) => setRecipe({ ...recipe, equipmentSubstitute: value })} />
              </SectionPanel>

              <SectionPanel title="食材" errors={generated.sectionErrors.ingredients}>
                <div className="flex justify-end">
                  <button
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-ink-300 hover:bg-white/[0.06]"
                    onClick={() => setIngredients([...ingredients, { source: "library", ingredientId: "", nameZh: "", nameEn: "", amount: "", optional: false, note: "" }])}
                    type="button"
                  >
                    <Plus size={14} aria-hidden="true" />
                    添加食材
                  </button>
                </div>
                <div className="space-y-4">
                  {ingredients.map((ingredient, index) => (
                    <div className="rounded-md border border-white/10 p-3" key={index}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-ink-100">食材 {index + 1}</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className={ingredient.source === "library" ? "rounded-md bg-scallion px-2 py-1 text-xs font-semibold text-ink-950" : "rounded-md border border-white/10 px-2 py-1 text-xs text-ink-300"}
                            onClick={() => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, source: "library" } : item)))}
                            type="button"
                          >
                            从库选择
                          </button>
                          <button
                            className={ingredient.source === "custom" ? "rounded-md bg-scallion px-2 py-1 text-xs font-semibold text-ink-950" : "rounded-md border border-white/10 px-2 py-1 text-xs text-ink-300"}
                            onClick={() => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, source: "custom" } : item)))}
                            type="button"
                          >
                            未入库食材
                          </button>
                          <button className="flex size-8 items-center justify-center rounded-md border border-white/10 text-ink-300 hover:bg-white/[0.06]" onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))} type="button" aria-label="删除食材">
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3">
                        {ingredient.source === "library" ? (
                          <IngredientPicker
                            library={ingredientLibrary}
                            value={ingredient}
                            onSelect={(next) => setIngredients(ingredients.map((item, i) => (i === index ? next : item)))}
                          />
                        ) : (
                          <div className="grid gap-3 md:grid-cols-3">
                            <TextInput label="食材 ID" required={false} value={ingredient.ingredientId} onChange={(value) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, ingredientId: value } : item)))} hint="选填；留空会自动生成。" />
                            <TextInput label="中文名" required={false} value={ingredient.nameZh} onChange={(value) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, nameZh: value } : item)))} hint="中文名和英文名至少填一个。" />
                            <TextInput label="英文名" required={false} value={ingredient.nameEn} onChange={(value) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, nameEn: value } : item)))} hint="选填；没有英文名时会用中文名兜底。" />
                          </div>
                        )}
                        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                          <TextInput label="用量" value={ingredient.amount} onChange={(value) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, amount: value } : item)))} />
                          <TextInput label="备注" required={false} value={ingredient.note} onChange={(value) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, note: value } : item)))} />
                          <label className="mt-6 flex items-center gap-2 text-sm text-ink-300">
                            <input className="size-4 accent-scallion" checked={ingredient.optional} onChange={(event) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, optional: event.target.checked } : item)))} type="checkbox" />
                            可选
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionPanel>

              <SectionPanel title="步骤" errors={generated.sectionErrors.steps}>
                <div className="flex justify-end">
                  <button className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-ink-300 hover:bg-white/[0.06]" onClick={() => setSteps([...steps, { instruction: "", tip: "" }])} type="button">
                    <Plus size={14} aria-hidden="true" />
                    添加步骤
                  </button>
                </div>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div className="rounded-md border border-white/10 p-3" key={index}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-ink-300">步骤 {index + 1}</p>
                        <button className="flex size-8 items-center justify-center rounded-md border border-white/10 text-ink-300 hover:bg-white/[0.06]" onClick={() => setSteps(steps.filter((_, i) => i !== index))} type="button" aria-label="删除步骤">
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                      <TextArea label="步骤说明" value={step.instruction} onChange={(value) => setSteps(steps.map((item, i) => (i === index ? { ...item, instruction: value } : item)))} />
                      <TextInput label="新手提示" required={false} value={step.tip} onChange={(value) => setSteps(steps.map((item, i) => (i === index ? { ...item, tip: value } : item)))} />
                    </div>
                  ))}
                </div>
              </SectionPanel>

              <SectionPanel title="新手踩坑" errors={generated.sectionErrors.mistakes} optional>
                <TextArea label="踩坑提示，每行一个" required={false} value={recipe.mistakes} onChange={(value) => setRecipe({ ...recipe, mistakes: value })} />
              </SectionPanel>
            </>
          ) : kind === "substitution" ? (
            <>
              <SectionPanel title="食材基础信息" errors={generated.sectionErrors.basic}>
                <div className="grid gap-3 md:grid-cols-3">
                  <TextInput label="中文名" required={false} value={substitution.nameZh} onChange={(value) => setSubstitution({ ...substitution, nameZh: value })} hint="中文名和英文名至少填一个。" />
                  <TextInput label="英文名" required={false} value={substitution.nameEn} onChange={(value) => setSubstitution({ ...substitution, nameEn: value })} hint="选填；没有英文名时会用中文名兜底。" />
                  <TextInput label="拼音" required={false} value={substitution.pinyin} onChange={(value) => setSubstitution({ ...substitution, pinyin: value })} hint="选填；填写后会优先用于自动生成食材 ID。" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <TextInput label="自定义食材 ID" required={false} value={substitution.id} onChange={(value) => setSubstitution({ ...substitution, id: value })} hint="选填；留空自动生成。" />
                  <TextInput label="分类" required={false} value={substitution.category} onChange={(value) => setSubstitution({ ...substitution, category: value })} hint="选填；留空为未分类。" />
                </div>
                <TextInput label="搜索关键词，逗号分隔" required={false} value={substitution.keywords} onChange={(value) => setSubstitution({ ...substitution, keywords: value })} hint="选填；留空会用名称生成基础关键词。" />
                <TextInput label="中文别名，逗号分隔" required={false} value={substitution.aliasesZh} onChange={(value) => setSubstitution({ ...substitution, aliasesZh: value })} />
                <TextInput label="英文别名，逗号分隔" required={false} value={substitution.aliasesEn} onChange={(value) => setSubstitution({ ...substitution, aliasesEn: value })} />
                <TextInput label="拼音别名，逗号分隔" required={false} value={substitution.aliasesPinyin} onChange={(value) => setSubstitution({ ...substitution, aliasesPinyin: value })} />
                <TextInput label="常见用途，逗号分隔" required={false} value={substitution.uses} onChange={(value) => setSubstitution({ ...substitution, uses: value })} />
              </SectionPanel>
              <SectionPanel title="地区替代信息" errors={generated.sectionErrors.region} optional>
                <div className="grid gap-3 md:grid-cols-[10rem_1fr]">
                  <label className="grid gap-1 text-sm text-ink-300">
                    <RequiredLabel label="地区" required={false} />
                    <select className="control" value={substitution.region} onChange={(event) => setSubstitution({ ...substitution, region: event.target.value })}>
                      {regionOptions.map((region) => (
                        <option value={region} key={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TextInput label="替代方案" required={false} value={substitution.substitute} onChange={(value) => setSubstitution({ ...substitution, substitute: value })} />
                </div>
                <TextInput label="哪里买" required={false} value={substitution.where} onChange={(value) => setSubstitution({ ...substitution, where: value })} />
                <TextArea label="使用差异" required={false} value={substitution.note} onChange={(value) => setSubstitution({ ...substitution, note: value })} />
                <TextInput label="相似度 1-5" required={false} value={substitution.similarity} onChange={(value) => setSubstitution({ ...substitution, similarity: value })} />
              </SectionPanel>
            </>
          ) : (
            <>
              <SectionPanel title="厨具基础信息" errors={generated.sectionErrors.basic}>
                <div className="grid gap-3 md:grid-cols-3">
                  <TextInput label="自定义厨具 ID" required={false} value={equipment.id} onChange={(value) => setEquipment({ ...equipment, id: value })} hint="选填；留空自动生成。" />
                  <TextInput label="中文名" required={false} value={equipment.nameZh} onChange={(value) => setEquipment({ ...equipment, nameZh: value })} hint="中文名和英文名至少填一个。" />
                  <TextInput label="英文名" required={false} value={equipment.nameEn} onChange={(value) => setEquipment({ ...equipment, nameEn: value })} hint="选填；没有英文名时会用中文名兜底。" />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="grid gap-1 text-sm text-ink-300">
                    <RequiredLabel label="分类" required={false} />
                    <select className="control" value={equipment.category} onChange={(event) => setEquipment({ ...equipment, category: event.target.value })}>
                      <option value="must_have">必买</option>
                      <option value="optional_upgrade">可选升级</option>
                      <option value="dorm_friendly">宿舍友好</option>
                      <option value="avoid_first">先别急着买</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm text-ink-300">
                    <RequiredLabel label="预算" required={false} />
                    <select className="control" value={equipment.budgetLevel} onChange={(event) => setEquipment({ ...equipment, budgetLevel: event.target.value as BudgetLevel })}>
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>
                  </label>
                  <label className="mt-6 flex items-center gap-2 text-sm text-ink-300">
                    <input className="size-4 accent-scallion" checked={equipment.essential} onChange={(event) => setEquipment({ ...equipment, essential: event.target.checked })} type="checkbox" />
                    是否必买（选填）
                  </label>
                </div>
                <TextInput label="使用场景，逗号分隔" required={false} value={equipment.uses} onChange={(value) => setEquipment({ ...equipment, uses: value })} hint="选填；留空会用厨具名称兜底。" />
                <TextInput label="没有时可替代，逗号分隔" required={false} value={equipment.substitutes} onChange={(value) => setEquipment({ ...equipment, substitutes: value })} />
              </SectionPanel>
              <SectionPanel title="地区购买信息" errors={generated.sectionErrors.region} optional>
                <div className="grid gap-3 md:grid-cols-[10rem_1fr_12rem]">
                  <label className="grid gap-1 text-sm text-ink-300">
                    <RequiredLabel label="地区" required={false} />
                    <select className="control" value={equipment.region} onChange={(event) => setEquipment({ ...equipment, region: event.target.value })}>
                      {regionOptions.map((region) => (
                        <option value={region} key={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TextInput label="哪里买" required={false} value={equipment.where} onChange={(value) => setEquipment({ ...equipment, where: value })} />
                  <TextInput label="价格区间" required={false} value={equipment.priceRange} onChange={(value) => setEquipment({ ...equipment, priceRange: value })} />
                </div>
                <TextArea label="购买建议" required={false} value={equipment.note} onChange={(value) => setEquipment({ ...equipment, note: value })} />
              </SectionPanel>
            </>
          )}
        </section>

        <aside className="surface rounded-md p-4 xl:sticky xl:top-20 xl:self-start">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-ink-100">YAML 预览</h2>
            {previewActions}
          </div>
          <p className="mt-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-ink-300">目标文件：{generated.targetPath}</p>
          <button className="mt-3 w-full rounded-md border border-white/10 px-3 py-2 text-sm text-ink-300 xl:hidden" onClick={() => setPreviewOpen((value) => !value)} type="button">
            {previewOpen ? "收起 YAML 预览" : "展开 YAML 预览"}
          </button>
          <pre className={(previewOpen ? "block" : "hidden") + " mt-4 max-h-[42rem] overflow-auto rounded-md border border-white/10 bg-ink-950 p-4 text-xs leading-5 text-ink-300 xl:block"}>
            <code>{generated.yaml}</code>
          </pre>
        </aside>
      </div>
    </div>
  );
}
