"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Download, ExternalLink, ImagePlus, Mail, Plus, RotateCcw, Save, Search, Trash2 } from "lucide-react";
import { RequiredLabel, TextArea, TextInput } from "@/components/form-controls";
import { scenarioDefinitions } from "@/lib/recommendations";
import type { Equipment, RecommendationScenario, Substitution } from "@/lib/schemas";

type ContributionKind = "recipe" | "substitution" | "equipment" | "starter";
type RecipeType = "chinese" | "fusion" | "local_adapted";
type BudgetLevel = "low" | "medium" | "high";
type IngredientSource = "library" | "custom";
type SectionKey = "basic" | "scenarios" | "equipment" | "ingredients" | "steps" | "mistakes" | "media" | "region";
type ImageMode = "none" | "upload" | "url";

type PreparedImage = {
  blob: Blob;
  previewUrl: string;
  sourceName: string;
  width: number;
  height: number;
};

type ImageDraft = {
  mode: ImageMode;
  url: string;
  alt: string;
  caption: string;
  credit: string;
  rightsConfirmed: boolean;
  file?: PreparedImage;
};

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
  image: ImageDraft;
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

const tabs: Array<{ id: ContributionKind; label: string; description: string }> = [
  { id: "recipe", label: "分享一道菜", description: "食材、步骤和成品图" },
  { id: "substitution", label: "补充一种食材", description: "当地叫什么、去哪里买" },
  { id: "equipment", label: "推荐一件厨具", description: "价格、用途和替代方案" },
  { id: "starter", label: "分享落地经验", description: "超市、采购与避坑" }
];

const regionOptions = ["uk", "north_america", "europe", "australia", "japan_korea"];
const regionLabels: Record<string, string> = {
  uk: "英国",
  north_america: "美国 / 北美",
  europe: "欧洲其他地区",
  australia: "澳大利亚 / 新西兰",
  japan_korea: "日本 / 韩国"
};
const DRAFT_STORAGE_KEY = "woklocal-contribution-draft-v1";

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
  { source: "library", ingredientId: "xihongshi", nameZh: "番茄", nameEn: "Tomato", amount: "1 个", optional: false, note: "" },
  { source: "library", ingredientId: "cheddar", nameZh: "切达奶酪", nameEn: "Cheddar cheese", amount: "一小把", optional: false, note: "" }
];

const emptyImageDraft = (): ImageDraft => ({ mode: "none", url: "", alt: "", caption: "", credit: "", rightsConfirmed: false });

const defaultSteps: RecipeStepDraft[] = [
  { instruction: "把主要食材切好。", tip: "新手先把所有食材放在手边。", image: emptyImageDraft() },
  { instruction: "按顺序下锅，调味后出锅。", tip: "", image: emptyImageDraft() }
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

const defaultStarterPack = {
  id: "uk-first-week-community",
  region: "uk",
  title: "英国落地清单与注意事项",
  summary: "刚落地先按优先级买齐能做饭的基础物品，其他内容慢慢补。",
  content:
    "## 今天就买\n- 不粘平底锅：IKEA、Argos、Tesco Extra 或 Amazon UK，约 £10-£25。24-28cm 最通用。\n- 洗碗套装：洗洁精、海绵、厨房纸先买齐。\n\n## 三天内补齐\n- 小电饭煲：Argos、Amazon UK 或亚超，约 £20-£45。一人食 0.6L-1L 足够。\n\n## 注意事项\n- 宿舍先确认是否允许使用电饭煲、空气炸锅等高功率电器。\n- 不确定会不会长期做饭时，先别一次买太多升级厨具。"
};

const emptyRecipe = { ...defaultRecipe, id: "", nameZh: "", pinyin: "", nameEn: "", description: "", cuisine: "", tags: "", equipmentSubstitute: "", videoUrl: "", mistakes: "" };
const emptySubstitution = { ...defaultSubstitution, id: "", nameZh: "", nameEn: "", pinyin: "", category: "", aliasesZh: "", aliasesEn: "", aliasesPinyin: "", keywords: "", uses: "", substitute: "", where: "", note: "", similarity: "" };
const emptyEquipment = { ...defaultEquipment, id: "", nameZh: "", nameEn: "", uses: "", substitutes: "", where: "", priceRange: "", note: "", essential: false };
const emptyStarterPack = { ...defaultStarterPack, id: "", title: "", summary: "", content: "" };
const emptyIngredient = (): RecipeIngredientDraft => ({ source: "library", ingredientId: "", nameZh: "", nameEn: "", amount: "", optional: false, note: "" });
const emptyStep = (): RecipeStepDraft => ({ instruction: "", tip: "", image: emptyImageDraft() });

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

function yamlBlockScalar(value: string, indent: number) {
  const padding = " ".repeat(indent);
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => `${padding}${line}`)
    .join("\n");
}

function isValidId(value: string) {
  return /^[a-z0-9-]+$/.test(value.trim());
}

function validateUrl(value: string) {
  return !value.trim() || /^https?:\/\/\S+$/i.test(value.trim());
}

function hasImage(image: ImageDraft) {
  return image.mode === "upload" ? Boolean(image.file) : image.mode === "url" && Boolean(image.url.trim());
}

function suggestedImageName(recipeId: string, slot: "cover" | number) {
  return `${recipeId}-${slot === "cover" ? "cover" : `step-${slot}`}.webp`;
}

function imageSource(image: ImageDraft, localPath: string) {
  return image.mode === "url" ? image.url.trim() : localPath;
}

function imageYaml(image: ImageDraft, key: "cover_image" | "image", indent: number, localPath: string) {
  if (!hasImage(image)) return "";

  const padding = " ".repeat(indent);
  const childPadding = " ".repeat(indent + 2);
  const lines = [`${padding}${key}:`, `${childPadding}src: ${quote(imageSource(image, localPath))}`, `${childPadding}alt: ${quote(image.alt.trim())}`];
  if (image.caption.trim()) lines.push(`${childPadding}caption: ${quote(image.caption.trim())}`);
  if (image.credit.trim()) lines.push(`${childPadding}credit: ${quote(image.credit.trim())}`);
  return lines.join("\n");
}

async function optimizeImage(file: File): Promise<PreparedImage> {
  if (!/image\/(jpeg|png|webp)/.test(file.type)) {
    throw new Error("请上传 JPG、PNG 或 WebP 图片。");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("图片请控制在 12MB 以内。");
  }

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("这张图片无法读取。"));
      element.src = sourceUrl;
    });
    const longestEdge = 1600;
    const scale = Math.min(1, longestEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("浏览器无法处理这张图片。");
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("图片压缩失败。"))), "image/webp", 0.82);
    });
    return { blob, previewUrl: URL.createObjectURL(blob), sourceName: file.name, width, height };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function downloadPreparedImage(image: PreparedImage, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = image.previewUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function firstNonEmpty(...values: string[]) {
  return values.map((value) => value.trim()).find(Boolean) ?? "";
}

function generatedId(...values: string[]) {
  const source = firstNonEmpty(...values);
  const slug = slugify(source);
  if (slug) return slug;
  if (!source) return "";

  let hash = 2166136261;
  for (const character of source) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `entry-${(hash >>> 0).toString(36)}`;
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

  return "https://github.com/SunRichardSKT/WokLocal/issues/new";
}

function buildIssueUrl(title: string, body: string, labels: string[]) {
  const base = deriveIssueBaseUrl();
  if (!base) return "";

  const params = new URLSearchParams({ title, body, labels: labels.join(",") });
  return `${base}?${params.toString()}`;
}

function ImageEditor({
  image,
  onChange,
  suggestedName,
  title
}: {
  image: ImageDraft;
  onChange: (image: ImageDraft) => void;
  suggestedName: string;
  title: string;
}) {
  const [error, setError] = useState("");
  const active = hasImage(image);

  async function handleFile(file?: File) {
    if (!file) return;
    try {
      setError("");
      const prepared = await optimizeImage(file);
      if (image.file?.previewUrl) URL.revokeObjectURL(image.file.previewUrl);
      onChange({ ...image, mode: "upload", url: "", file: prepared });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "图片处理失败。" );
    }
  }

  function chooseMode(mode: ImageMode) {
    if (image.file?.previewUrl && mode !== "upload") URL.revokeObjectURL(image.file.previewUrl);
    onChange({ ...image, mode, url: mode === "url" ? image.url : "", file: mode === "upload" ? image.file : undefined });
    setError("");
  }

  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink-100">{title}</p>
          <p className="mt-1 text-xs leading-5 text-ink-500">推荐上传到本地后压缩为 WebP；页面不会直接上传文件，生成投稿后请把下载的图片附到 Issue 或邮件。</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {([
            ["none", "不添加"],
            ["upload", "本地图片"],
            ["url", "外部链接"]
          ] as Array<[ImageMode, string]>).map(([mode, label]) => (
            <button className={image.mode === mode ? "rounded-md bg-scallion px-2 py-1 text-xs font-semibold text-ink-950" : "rounded-md border border-white/10 px-2 py-1 text-xs text-ink-300 hover:bg-white/[0.06]"} key={mode} onClick={() => chooseMode(mode)} type="button">
              {label}
            </button>
          ))}
        </div>
      </div>

      {image.mode === "upload" ? (
        <div className="mt-3 grid gap-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-white/20 px-3 py-4 text-sm text-ink-300 transition hover:border-scallion/50 hover:bg-scallion/[0.05]">
            <ImagePlus size={17} className="text-scallion" aria-hidden="true" />
            选择 JPG、PNG 或 WebP 图片（最大 12MB）
            <input className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleFile(event.target.files?.[0])} type="file" />
          </label>
          {image.file ? (
            <div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <img className="aspect-[4/3] w-full rounded-md border border-white/10 object-cover" src={image.file.previewUrl} alt="投稿图片预览" />
              <div className="min-w-0 text-sm leading-6 text-ink-300">
                <p className="truncate text-ink-100">{image.file.sourceName}</p>
                <p className="text-ink-500">已压缩为 {image.file.width} x {image.file.height} WebP</p>
                <p className="mt-2 break-all text-ink-300">建议路径：<code className="text-scallion">/recipe-media/{suggestedName}</code></p>
                <button className="mt-2 inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-ink-300 hover:bg-white/[0.06]" onClick={() => downloadPreparedImage(image.file!, suggestedName)} type="button">
                  <Download size={14} aria-hidden="true" />
                  下载压缩图
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {image.mode === "url" ? (
        <div className="mt-3">
          <TextInput inputMode="url" label="图片链接" value={image.url} onChange={(url) => onChange({ ...image, url })} placeholder="https://..." hint="仅使用你有权使用、且长期稳定的图片链接；站内本地图片更可靠。" />
        </div>
      ) : null}

      {active ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput label="图片说明" value={image.alt} onChange={(alt) => onChange({ ...image, alt })} hint="必填，用一句话说明画面内容。" />
          <TextInput label="图片来源 / 作者" required={false} value={image.credit} onChange={(credit) => onChange({ ...image, credit })} hint="选填，建议写明本人拍摄、授权来源或作者。" />
          <div className="sm:col-span-2">
            <TextInput label="图片图注" required={false} value={image.caption} onChange={(caption) => onChange({ ...image, caption })} hint="选填，会显示在图片下方。" />
          </div>
          <label className="flex min-h-11 items-start gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-ink-300 sm:col-span-2">
            <input className="mt-1 size-4 shrink-0 accent-scallion" checked={image.rightsConfirmed} onChange={(event) => onChange({ ...image, rightsConfirmed: event.target.checked })} type="checkbox" />
            <span>我确认这是本人拍摄、公共领域，或已经获得允许公开使用的图片，并愿意提供来源信息。</span>
          </label>
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-chili">{error}</p> : null}
    </div>
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
      <summary className="section-summary cursor-pointer select-none text-sm font-semibold text-ink-100">
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

function CompletionSummary({ generated, validationVisible }: { generated: GeneratedContribution; validationVisible: boolean }) {
  const complete = generated.validationErrors.length === 0;

  if (!validationVisible && !complete) {
    return (
      <section className="rounded-md border border-white/10 bg-white/[0.035] p-3" aria-live="polite">
        <p className="text-sm font-semibold text-ink-100">{generated.completedRequired}/{generated.totalRequired} 项基本信息已完成</p>
        <p className="mt-1 text-sm leading-6 text-ink-300">从你最确定的内容开始填。准备提交时，页面会统一检查遗漏。</p>
      </section>
    );
  }

  return (
    <section aria-live="polite" className={complete ? "rounded-md border border-scallion/25 bg-scallion/[0.08] p-3" : "rounded-md border border-chili/25 bg-chili/[0.08] p-3"}>
      <p className={complete ? "text-sm font-semibold text-scallion" : "text-sm font-semibold text-chili"}>
        {generated.completedRequired}/{generated.totalRequired} 必填项已完成
      </p>
      <p className="mt-1 text-sm leading-6 text-ink-300">
        {complete ? "内容已经可以提交。你可以选择 GitHub 或邮件投稿。" : `还有 ${generated.validationErrors.length} 个问题需要修正。`}
      </p>
    </section>
  );
}

function MarkdownPreview({ value }: { value: string }) {
  const lines = value.trim() ? value.replace(/\r\n/g, "\n").split("\n") : ["还没有填写主要内容。"];

  return (
    <div className="mt-3 max-h-72 overflow-auto rounded-md border border-white/10 bg-ink-950 p-3 text-sm leading-6 text-ink-300">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div className="h-2" key={`blank-${index}`} />;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 className="mt-3 font-semibold text-ink-100 first:mt-0" key={`h3-${index}`}>
              {trimmed.slice(4)}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3 className="mt-4 text-base font-semibold text-ink-100 first:mt-0" key={`h2-${index}`}>
              {trimmed.slice(3)}
            </h3>
          );
        }

        if (trimmed.startsWith("# ")) {
          return (
            <h2 className="mt-4 text-lg font-semibold text-ink-100 first:mt-0" key={`h1-${index}`}>
              {trimmed.slice(2)}
            </h2>
          );
        }

        const bullet = trimmed.match(/^[-*]\s+(.+)$/);
        if (bullet) {
          return (
            <p className="flex gap-2" key={`bullet-${index}`}>
              <span className="text-scallion">•</span>
              <span>{bullet[1]}</span>
            </p>
          );
        }

        const numbered = trimmed.match(/^(\d+)\.\s+(.+)$/);
        if (numbered) {
          return (
            <p className="flex gap-2" key={`numbered-${index}`}>
              <span className="text-scallion">{numbered[1]}.</span>
              <span>{numbered[2]}</span>
            </p>
          );
        }

        return <p key={`paragraph-${index}`}>{trimmed}</p>;
      })}
    </div>
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
  onSelect,
  onCreateCustom
}: {
  library: Substitution[];
  value: RecipeIngredientDraft;
  onSelect: (ingredient: RecipeIngredientDraft) => void;
  onCreateCustom: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return library.slice(0, 8);
    return library.filter((item) => ingredientSearchText(item).includes(normalized)).slice(0, 8);
  }, [library, query]);

  return (
    <div className="grid gap-2">
      {value.ingredientId ? (
        <p className="rounded-md border border-scallion/25 bg-scallion/[0.08] px-3 py-2 text-sm text-ink-300">
          已选择：<strong className="text-scallion">{value.nameZh || value.nameEn}</strong>
          <span className="ml-2 font-mono text-xs text-ink-500">{value.ingredientId}</span>
        </p>
      ) : null}
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} aria-hidden="true" />
        <span className="sr-only">搜索已有食材</span>
        <input aria-label="搜索已有食材" className="control w-full pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入中文或英文，例如：生抽、soy sauce" />
      </label>
      <div aria-label="食材搜索结果" className="grid max-h-52 gap-2 overflow-auto rounded-md border border-white/10 bg-ink-950 p-2" role="listbox">
        {matches.map((item) => {
          const active = value.source === "library" && value.ingredientId === item.ingredient_id;
          return (
            <button
              className={active ? "rounded-md border border-scallion bg-scallion/[0.12] p-2 text-left" : "rounded-md border border-white/10 bg-white/[0.035] p-2 text-left hover:border-scallion/40"}
              key={item.ingredient_id}
              onClick={() =>
                { onSelect({
                  ...value,
                  source: "library",
                  ingredientId: item.ingredient_id,
                  nameZh: item.name_zh,
                  nameEn: item.name_en
                }); setQuery(item.name_zh); }
              }
              role="option"
              aria-selected={active}
              type="button"
            >
              <span className="block text-sm font-medium text-ink-100">{item.name_zh}</span>
              <span className="mt-1 block text-xs text-ink-500">
                {item.ingredient_id} · {item.name_en}
              </span>
            </button>
          );
        })}
        {matches.length === 0 ? (
          <div className="p-3 text-center text-sm leading-6 text-ink-300">
            <p>食材库里暂时没找到“{query.trim()}”。</p>
            <button className="mt-2 min-h-11 rounded-md border border-scallion/30 px-3 py-2 font-semibold text-scallion" onClick={() => onCreateCustom(query.trim())} type="button">
              作为新食材填写
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ContributionGenerator({ ingredients: ingredientLibrary, equipmentItems }: ContributionGeneratorProps) {
  const [kind, setKind] = useState<ContributionKind>("recipe");
  const [copied, setCopied] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedIssue, setCopiedIssue] = useState(false);
  const [validationVisible, setValidationVisible] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [draftStatus, setDraftStatus] = useState("草稿会自动保存在这台设备上");
  const [actionMessage, setActionMessage] = useState("");

  const [recipe, setRecipe] = useState(emptyRecipe);
  const [recipeScenarios, setRecipeScenarios] = useState<RecommendationScenario[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<RecipeIngredientDraft[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<RecipeStepDraft[]>([emptyStep()]);
  const [coverImage, setCoverImage] = useState<ImageDraft>(emptyImageDraft);
  const [substitution, setSubstitution] = useState(emptySubstitution);
  const [equipment, setEquipment] = useState(emptyEquipment);
  const [starterPack, setStarterPack] = useState(emptyStarterPack);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        setKind(draft.kind ?? "recipe");
        setRecipe(draft.recipe ?? emptyRecipe);
        setRecipeScenarios(draft.recipeScenarios ?? []);
        setSelectedEquipmentIds(draft.selectedEquipmentIds ?? []);
        setIngredients(draft.ingredients?.length ? draft.ingredients : [emptyIngredient()]);
        setSteps(draft.steps?.length ? draft.steps : [emptyStep()]);
        setCoverImage(draft.coverImage ?? emptyImageDraft());
        setSubstitution(draft.substitution ?? emptySubstitution);
        setEquipment(draft.equipment ?? emptyEquipment);
        setStarterPack(draft.starterPack ?? emptyStarterPack);
        setDraftStatus("已恢复上次未提交的草稿");
      }
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      setSubstitution((current) => ({ ...current, nameZh: query, id: "" }));
      setKind("substitution");
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    setDraftStatus("正在保存草稿…");
    const timer = window.setTimeout(() => {
      const withoutFile = (image: ImageDraft): ImageDraft => image.mode === "upload" ? emptyImageDraft() : { ...image, file: undefined };
      const draft = {
        kind,
        recipe,
        recipeScenarios,
        selectedEquipmentIds,
        ingredients,
        steps: steps.map((step) => ({ ...step, image: withoutFile(step.image) })),
        coverImage: withoutFile(coverImage),
        substitution,
        equipment,
        starterPack
      };
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setDraftStatus("草稿已自动保存（图片除外）");
    }, 350);
    return () => window.clearTimeout(timer);
  }, [coverImage, draftReady, equipment, ingredients, kind, recipe, recipeScenarios, selectedEquipmentIds, starterPack, steps, substitution]);

  function loadExample() {
    setRecipe(defaultRecipe);
    setRecipeScenarios(["low_budget", "tesco_friendly"]);
    setSelectedEquipmentIds(["nonstick-pan", "spatula"]);
    setIngredients(defaultIngredients);
    setSteps(defaultSteps);
    setCoverImage(emptyImageDraft());
    setSubstitution(defaultSubstitution);
    setEquipment(defaultEquipment);
    setStarterPack(defaultStarterPack);
    setValidationVisible(false);
    setActionMessage("已填入示例，可以直接修改成自己的内容。");
  }

  function clearCurrent() {
    if (!window.confirm("确定清空当前类型的草稿吗？此操作无法撤销。")) return;
    if (kind === "recipe") {
      setRecipe(emptyRecipe);
      setRecipeScenarios([]);
      setSelectedEquipmentIds([]);
      setIngredients([emptyIngredient()]);
      setSteps([emptyStep()]);
      setCoverImage(emptyImageDraft());
    } else if (kind === "substitution") {
      setSubstitution(emptySubstitution);
    } else if (kind === "equipment") {
      setEquipment(emptyEquipment);
    } else {
      setStarterPack(emptyStarterPack);
    }
    setValidationVisible(false);
    setActionMessage("当前表单已清空。");
  }

  const generated = useMemo<GeneratedContribution>(() => {
    const sectionErrors: Partial<Record<SectionKey, string[]>> = {};
    let yaml = "";
    let targetPath = "";
    let issueTitle = "";
    let mediaSubmission = "";
    let completedRequired = 0;
    let totalRequired = 0;

    if (kind === "recipe") {
      const id = generatedId(recipe.id, recipe.pinyin, recipe.nameEn, recipe.nameZh) || "new-recipe";
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
      const imageEntries = [
        { image: coverImage, name: suggestedImageName(id, "cover"), label: "菜谱封面" },
        ...usableSteps.map((step, index) => ({ image: step.image, name: suggestedImageName(id, index + 1), label: `步骤 ${index + 1}` }))
      ].filter((entry) => hasImage(entry.image));

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
      imageEntries.forEach((entry) => {
        if (!entry.image.alt.trim()) addError(sectionErrors, "media", `${entry.label}需要填写图片说明。`);
        if (entry.image.mode === "url" && !validateUrl(entry.image.url)) addError(sectionErrors, "media", `${entry.label}的外部图片链接无效。`);
        if (!entry.image.rightsConfirmed) addError(sectionErrors, "media", `${entry.label}需要确认图片使用权。`);
      });

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
          const ingredientId = item.source === "library" ? item.ingredientId : generatedId(item.ingredientId, item.nameEn, item.nameZh) || `custom-ingredient-${index + 1}`;
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
      const coverBlock = imageYaml(coverImage, "cover_image", 0, `/recipe-media/${suggestedImageName(id, "cover")}`);
      const stepBlock = usableSteps
        .map((step, index) => {
          const lines = [`  - order: ${index + 1}`, `    instruction: ${quote(step.instruction)}`];
          if (step.tip.trim()) lines.push(`    tip: ${quote(step.tip)}`);
          const stepImageBlock = imageYaml(step.image, "image", 4, `/recipe-media/${suggestedImageName(id, index + 1)}`);
          if (stepImageBlock) lines.push(stepImageBlock);
          return lines.join("\n");
        })
        .join("\n");
      const uploadedImages = imageEntries.filter((entry) => entry.image.mode === "upload");
      if (uploadedImages.length > 0) {
        mediaSubmission = `\n\n图片附件（请把下列下载的压缩图拖入这个 Issue；邮件投稿则作为附件发送）：\n${uploadedImages
          .map((entry) => `- ${entry.name}（${entry.label}，发布路径：\`/public/recipe-media/${entry.name}\`）`)
          .join("\n")}\n\n维护说明：图片放入 \`public/recipe-media/\` 后，下面 YAML 的站内路径即可直接生效。`;
      }

      yaml = `id: ${id}
name:
  zh: ${quote(firstNonEmpty(recipe.nameZh, recipe.nameEn, "未命名菜谱"))}
  pinyin: ${quote(recipePinyin)}
  en: ${quote(recipeNameEn)}
description: ${quote(recipe.description)}
${coverBlock ? `${coverBlock}\n` : ""}difficulty: ${numericDifficulty || 2}
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
      const id = generatedId(substitution.id, substitution.pinyin, substitution.nameEn, substitution.nameZh) || "new-ingredient";
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
    } else if (kind === "equipment") {
      const id = generatedId(equipment.id, equipment.nameEn, equipment.nameZh) || "new-equipment";
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
    } else {
      const id = generatedId(starterPack.id, starterPack.title, starterPack.region) || "new-starter-pack";
      const title = firstNonEmpty(starterPack.title, `${starterPack.region} 落地清单与注意事项`);
      const summary = firstNonEmpty(starterPack.summary, "按优先级整理刚落地做饭需要购买的物品和注意事项。");
      const content = firstNonEmpty(starterPack.content);
      const requiredChecks = [title, starterPack.region, content];
      totalRequired = requiredChecks.length;
      completedRequired = countFilled(requiredChecks);

      if (!starterPack.title.trim()) addError(sectionErrors, "basic", "清单标题不能为空。");
      if (!content) addError(sectionErrors, "basic", "主要内容不能为空。");

      targetPath = `data/starter-packs/${id}.yaml`;
      issueTitle = `落地清单：${title}`;
      yaml = `pack_id: ${id}
region: ${starterPack.region}
title: ${quote(title)}
summary: ${quote(summary)}
sections:
  - title: "主要内容"
    priority: today
    items:
      - name: "自由格式落地经验"
        category: "落地清单"
        where_to_buy: ["见备注"]
        estimated_budget: "见备注"
        note: |
${yamlBlockScalar(content || "请补充主要内容。", 10)}
`;
    }

    const validationErrors = Object.values(sectionErrors).flat();
    const issueBody = `目标文件：\`${targetPath}\`\n\n请审阅下面的 YAML：\n\n\`\`\`yaml\n${yaml}\`\`\`${mediaSubmission}`;
    return { targetPath, fileName: targetPath.split("/").pop() ?? "contribution.yaml", yaml, issueTitle, issueBody, validationErrors, sectionErrors, completedRequired, totalRequired };
  }, [coverImage, equipment, equipmentItems, ingredients, kind, recipe, recipeScenarios, selectedEquipmentIds, starterPack, steps, substitution]);

  const issueUrl =
    generated.validationErrors.length === 0
      ? buildIssueUrl(generated.issueTitle, generated.issueBody, [kind === "recipe" ? "recipe" : kind === "substitution" ? "substitution" : kind === "equipment" ? "equipment" : "starter-pack"])
      : "";

  async function writeClipboard(text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text);
      setActionMessage(successMessage);
      return true;
    } catch {
      setActionMessage("浏览器没有允许复制。请在下方高级选项中展开内容后手动选择复制。");
      return false;
    }
  }

  async function copyYaml() {
    if (!await writeClipboard(generated.yaml, "YAML 已复制。")) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function copyPath() {
    if (!await writeClipboard(generated.targetPath, "目标路径已复制。")) return;
    setCopiedPath(true);
    window.setTimeout(() => setCopiedPath(false), 1400);
  }

  async function copyIssueBody() {
    if (!await writeClipboard(generated.issueBody, "投稿内容已复制，可以粘贴到 Issue 或邮件正文。")) return;
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
  const visibleErrors = (section: SectionKey) => validationVisible ? generated.sectionErrors[section] : [];

  function checkContent() {
    setValidationVisible(true);
    setActionMessage(disabled ? `还需要处理 ${generated.validationErrors.length} 个问题，已在对应区块标出。` : "内容检查通过，可以选择 GitHub 或邮件投稿。");
  }

  async function submitByEmail() {
    setValidationVisible(true);
    if (disabled) {
      setActionMessage(`还需要处理 ${generated.validationErrors.length} 个问题，已在对应区块标出。`);
      return;
    }
    const copiedSuccessfully = await writeClipboard(generated.issueBody, "投稿内容已复制，正在打开邮箱。请粘贴到邮件正文并发送。");
    if (!copiedSuccessfully) return;
    const subject = encodeURIComponent(`就地开饭投稿 - ${generated.issueTitle}`);
    const body = encodeURIComponent("投稿内容已复制到剪贴板，请在这里粘贴。\n\n如有菜谱图片，也请作为附件添加。\n");
    window.location.href = `mailto:guyanrichard@qq.com?subject=${subject}&body=${body}`;
  }

  const advancedActions = (
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
    </div>
  );

  return (
    <div className="contribution-editor space-y-5">
      <div className="surface rounded-md p-2" aria-label="选择投稿类型">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {tabs.map((tab) => (
            <button
              aria-pressed={tab.id === kind}
              className={tab.id === kind ? "min-h-16 rounded-md bg-scallion px-3 py-2 text-left text-ink-950" : "min-h-16 rounded-md px-3 py-2 text-left text-ink-300 hover:bg-white/[0.06]"}
              key={tab.id}
              onClick={() => {
                setKind(tab.id);
                setValidationVisible(false);
                setActionMessage("");
              }}
              type="button"
            >
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className={tab.id === kind ? "mt-1 block text-xs text-ink-950/70" : "mt-1 block text-xs text-ink-500"}>{tab.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 text-sm text-ink-300 sm:grid-cols-3" aria-label="投稿步骤">
        {["1. 填写你知道的内容", "2. 检查有没有遗漏", "3. 用 GitHub 或邮件提交"].map((step, index) => (
          <div className={"rounded-md border px-3 py-2 " + (index === 0 ? "border-scallion/35 bg-scallion/[0.08] text-ink-100" : "border-white/10 bg-white/[0.025]")} key={step}>{step}</div>
        ))}
      </div>

      <CompletionSummary generated={generated} validationVisible={validationVisible} />

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.62fr)]">
        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-100">填写投稿内容</h2>
              <p className="mt-1 text-sm leading-6 text-ink-300">只填你确定的信息即可。技术字段会自动生成，草稿会保存在当前浏览器。</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500" aria-live="polite"><Save size={14} aria-hidden="true" />{draftStatus}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-ink-100 hover:bg-white/[0.06]" onClick={loadExample} type="button">
                <RotateCcw size={16} aria-hidden="true" />
                填入示例
              </button>
              <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-chili/30 px-3 py-2 text-sm font-semibold text-chili hover:bg-chili/[0.08]" onClick={clearCurrent} type="button">
                <Trash2 size={16} aria-hidden="true" />
                清空当前表单
              </button>
            </div>
          </div>

          {kind === "recipe" ? (
            <>
              <SectionPanel title="基础信息" errors={visibleErrors("basic")}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput label="中文名" required={false} value={recipe.nameZh} onChange={(value) => setRecipe({ ...recipe, nameZh: value })} hint="中文名和英文名至少填一个。" />
                  <TextInput label="英文名" required={false} value={recipe.nameEn} onChange={(value) => setRecipe({ ...recipe, nameEn: value })} hint="选填；没有英文名时会用中文名兜底。" />
                </div>
                <TextArea label="简介" value={recipe.description} onChange={(value) => setRecipe({ ...recipe, description: value })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput inputMode="numeric" label="难度 1-5" value={recipe.difficulty} onChange={(value) => setRecipe({ ...recipe, difficulty: value })} />
                  <TextInput inputMode="numeric" label="耗时/分钟" value={recipe.timeMinutes} onChange={(value) => setRecipe({ ...recipe, timeMinutes: value })} />
                  <TextInput inputMode="numeric" label="份量" value={recipe.servings} onChange={(value) => setRecipe({ ...recipe, servings: value })} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
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
                <details className="rounded-md border border-white/10 bg-white/[0.025] p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-ink-300">更多信息（全部选填）</summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <TextInput label="拼音" required={false} value={recipe.pinyin} onChange={(value) => setRecipe({ ...recipe, pinyin: value })} hint="可帮助生成更易读的网址，不会拼音也可以留空。" />
                    <TextInput label="菜系" required={false} value={recipe.cuisine} onChange={(value) => setRecipe({ ...recipe, cuisine: value })} hint="留空时归为留学生厨房菜。" />
                    <TextInput inputMode="url" label="视频链接" required={false} value={recipe.videoUrl} onChange={(value) => setRecipe({ ...recipe, videoUrl: value })} placeholder="https://..." />
                    <TextInput label="自定义菜谱 ID" required={false} value={recipe.id} onChange={(value) => setRecipe({ ...recipe, id: value })} hint="给熟悉仓库结构的贡献者使用，通常无需填写。" />
                  </div>
                </details>
              </SectionPanel>

              <SectionPanel title="图片" errors={visibleErrors("media")} optional>
                <ImageEditor image={coverImage} onChange={setCoverImage} suggestedName={suggestedImageName(generated.fileName.replace(/\.yaml$/, "") || "new-recipe", "cover")} title="菜谱封面" />
                <p className="text-sm leading-6 text-ink-300">封面图推荐拍成横图，步骤图推荐只放关键动作。选择本地图片后，请下载压缩图；提交 Issue 时把图片拖入正文，邮件投稿则直接添加附件。</p>
              </SectionPanel>

              <SectionPanel title="推荐场景" errors={visibleErrors("scenarios")}>
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

              <SectionPanel title="厨具" errors={visibleErrors("equipment")}>
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

              <SectionPanel title="食材" errors={visibleErrors("ingredients")}>
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
                            onCreateCustom={(query) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, source: "custom", nameZh: item.nameZh || query } : item)))}
                          />
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <TextInput label="中文名" required={false} value={ingredient.nameZh} onChange={(value) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, nameZh: value } : item)))} hint="中文名和英文名至少填一个。" />
                            <TextInput label="英文名" required={false} value={ingredient.nameEn} onChange={(value) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, nameEn: value } : item)))} hint="选填；没有英文名时会用中文名兜底。" />
                          </div>
                        )}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <TextInput label="用量" value={ingredient.amount} onChange={(value) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, amount: value } : item)))} />
                          <TextInput label="备注" required={false} value={ingredient.note} onChange={(value) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, note: value } : item)))} />
                          <label className="flex min-h-11 items-center gap-2 text-sm text-ink-300 sm:self-end">
                            <input className="size-4 accent-scallion" checked={ingredient.optional} onChange={(event) => setIngredients(ingredients.map((item, i) => (i === index ? { ...item, optional: event.target.checked } : item)))} type="checkbox" />
                            可选
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionPanel>

              <SectionPanel title="步骤" errors={visibleErrors("steps")}>
                <div className="flex justify-end">
                  <button className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-ink-300 hover:bg-white/[0.06]" onClick={() => setSteps([...steps, { instruction: "", tip: "", image: emptyImageDraft() }])} type="button">
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
                      <ImageEditor
                        image={step.image}
                        onChange={(image) => setSteps(steps.map((item, i) => (i === index ? { ...item, image } : item)))}
                        suggestedName={suggestedImageName(generated.fileName.replace(/\.yaml$/, "") || "new-recipe", index + 1)}
                        title={`步骤 ${index + 1} 配图`}
                      />
                    </div>
                  ))}
                </div>
              </SectionPanel>

              <SectionPanel title="新手踩坑" errors={visibleErrors("mistakes")} optional>
                <TextArea label="踩坑提示，每行一个" required={false} value={recipe.mistakes} onChange={(value) => setRecipe({ ...recipe, mistakes: value })} />
              </SectionPanel>
            </>
          ) : kind === "substitution" ? (
            <>
              <SectionPanel title="食材基础信息" errors={visibleErrors("basic")}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput label="中文名" required={false} value={substitution.nameZh} onChange={(value) => setSubstitution({ ...substitution, nameZh: value })} hint="中文名和英文名至少填一个。" />
                  <TextInput label="英文名" required={false} value={substitution.nameEn} onChange={(value) => setSubstitution({ ...substitution, nameEn: value })} hint="选填；没有英文名时会用中文名兜底。" />
                </div>
                <TextInput label="常见用途，逗号分隔" required={false} value={substitution.uses} onChange={(value) => setSubstitution({ ...substitution, uses: value })} />
                <details className="rounded-md border border-white/10 bg-white/[0.025] p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-ink-300">搜索与分类信息（全部选填）</summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <TextInput label="分类" required={false} value={substitution.category} onChange={(value) => setSubstitution({ ...substitution, category: value })} hint="留空时归为未分类。" />
                    <TextInput label="拼音" required={false} value={substitution.pinyin} onChange={(value) => setSubstitution({ ...substitution, pinyin: value })} />
                    <TextInput label="中文别名，逗号分隔" required={false} value={substitution.aliasesZh} onChange={(value) => setSubstitution({ ...substitution, aliasesZh: value })} />
                    <TextInput label="英文别名，逗号分隔" required={false} value={substitution.aliasesEn} onChange={(value) => setSubstitution({ ...substitution, aliasesEn: value })} />
                    <TextInput label="拼音别名，逗号分隔" required={false} value={substitution.aliasesPinyin} onChange={(value) => setSubstitution({ ...substitution, aliasesPinyin: value })} />
                    <TextInput label="搜索关键词，逗号分隔" required={false} value={substitution.keywords} onChange={(value) => setSubstitution({ ...substitution, keywords: value })} />
                    <TextInput label="自定义食材 ID" required={false} value={substitution.id} onChange={(value) => setSubstitution({ ...substitution, id: value })} hint="通常无需填写，网站会自动生成。" />
                  </div>
                </details>
              </SectionPanel>
              <SectionPanel title="地区替代信息" errors={visibleErrors("region")} optional>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm text-ink-300">
                    <RequiredLabel label="地区" required={false} />
                    <select className="control" value={substitution.region} onChange={(event) => setSubstitution({ ...substitution, region: event.target.value })}>
                      {regionOptions.map((region) => (
                        <option value={region} key={region}>
                          {regionLabels[region]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TextInput label="替代方案" required={false} value={substitution.substitute} onChange={(value) => setSubstitution({ ...substitution, substitute: value })} />
                </div>
                <TextInput label="哪里买" required={false} value={substitution.where} onChange={(value) => setSubstitution({ ...substitution, where: value })} />
                <TextArea label="使用差异" required={false} value={substitution.note} onChange={(value) => setSubstitution({ ...substitution, note: value })} />
                <TextInput inputMode="numeric" label="相似度 1-5" required={false} value={substitution.similarity} onChange={(value) => setSubstitution({ ...substitution, similarity: value })} />
              </SectionPanel>
            </>
          ) : kind === "equipment" ? (
            <>
              <SectionPanel title="厨具基础信息" errors={visibleErrors("basic")}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput label="中文名" required={false} value={equipment.nameZh} onChange={(value) => setEquipment({ ...equipment, nameZh: value })} hint="中文名和英文名至少填一个。" />
                  <TextInput label="英文名" required={false} value={equipment.nameEn} onChange={(value) => setEquipment({ ...equipment, nameEn: value })} hint="选填；没有英文名时会用中文名兜底。" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
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
                  <label className="flex min-h-11 items-center gap-2 text-sm text-ink-300 sm:self-end">
                    <input className="size-4 accent-scallion" checked={equipment.essential} onChange={(event) => setEquipment({ ...equipment, essential: event.target.checked })} type="checkbox" />
                    是否必买（选填）
                  </label>
                </div>
                <TextInput label="使用场景，逗号分隔" required={false} value={equipment.uses} onChange={(value) => setEquipment({ ...equipment, uses: value })} hint="选填；留空会用厨具名称兜底。" />
                <TextInput label="没有时可替代，逗号分隔" required={false} value={equipment.substitutes} onChange={(value) => setEquipment({ ...equipment, substitutes: value })} />
                <details className="rounded-md border border-white/10 bg-white/[0.025] p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-ink-300">技术信息（选填）</summary>
                  <div className="mt-3"><TextInput label="自定义厨具 ID" required={false} value={equipment.id} onChange={(value) => setEquipment({ ...equipment, id: value })} hint="通常无需填写，网站会自动生成。" /></div>
                </details>
              </SectionPanel>
              <SectionPanel title="地区购买信息" errors={visibleErrors("region")} optional>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm text-ink-300">
                    <RequiredLabel label="地区" required={false} />
                    <select className="control" value={equipment.region} onChange={(event) => setEquipment({ ...equipment, region: event.target.value })}>
                      {regionOptions.map((region) => (
                        <option value={region} key={region}>
                          {regionLabels[region]}
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
          ) : (
            <>
              <SectionPanel title="清单基础信息" errors={visibleErrors("basic")}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput label="清单标题" value={starterPack.title} onChange={(value) => setStarterPack({ ...starterPack, title: value })} placeholder="英国落地清单与注意事项" />
                  <label className="grid gap-1 text-sm text-ink-300">
                    <RequiredLabel label="地区" />
                    <select className="control" value={starterPack.region} onChange={(event) => setStarterPack({ ...starterPack, region: event.target.value })}>
                      {regionOptions.map((region) => (
                        <option value={region} key={region}>
                          {regionLabels[region]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <TextArea label="清单简介" required={false} value={starterPack.summary} onChange={(value) => setStarterPack({ ...starterPack, summary: value })} hint="选填；说明这个地区刚落地时最重要的购买策略和注意事项。" />
              </SectionPanel>

              <SectionPanel title="主要内容" errors={visibleErrors("basic")}>
                <p className="text-sm leading-6 text-ink-300">
                  这里可以自由写 Markdown，不需要拆成固定条目。建议写清地区、购买地点、价格、优先级和注意事项；维护者后续会整理成结构化清单。
                </p>
                <TextArea
                  label="主要内容（Markdown）"
                  value={starterPack.content}
                  onChange={(value) => setStarterPack({ ...starterPack, content: value })}
                  hint="支持 ## 标题、- 列表、普通段落。"
                />
                <div className="rounded-md border border-white/10 bg-ink-950 p-3">
                  <p className="text-sm font-semibold text-ink-100">Markdown 预览</p>
                  <MarkdownPreview value={starterPack.content} />
                </div>
              </SectionPanel>
            </>
          )}
        </section>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start">
          <section className="surface rounded-md p-4 sm:p-5">
            <p className="eyebrow">最后一步</p>
            <h2 className="mt-2 text-xl font-semibold text-ink-100">检查并提交</h2>
            <p className="mt-2 text-sm leading-6 text-ink-300">本站不会自动公开你的内容。提交后，维护者会检查格式、图片来源和内容，再整理进网站。</p>
            <div className="mt-4 grid gap-2">
              <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-scallion/40 px-3 py-2 text-sm font-semibold text-scallion hover:bg-scallion/[0.08]" onClick={checkContent} type="button">
                <CheckCircle2 size={17} aria-hidden="true" />
                检查填写内容
              </button>
              {disabled ? (
                <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-scallion px-3 py-2 text-sm font-semibold text-ink-950" onClick={checkContent} type="button">先查看需要补充的内容</button>
              ) : (
                <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-scallion px-3 py-2 text-sm font-semibold text-ink-950 hover:brightness-105" href={issueUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={17} aria-hidden="true" />
                  用 GitHub 提交
                </a>
              )}
              <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-ink-100 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45" disabled={disabled} onClick={submitByEmail} type="button">
                <Mail size={17} aria-hidden="true" />
                没有 GitHub，使用邮件投稿
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-ink-500">邮件投稿会先复制内容，再打开邮件客户端。请在正文粘贴，并将图片作为附件添加。</p>
            {actionMessage ? <p className="mt-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm leading-6 text-ink-300" aria-live="polite">{actionMessage}</p> : null}
          </section>

          <details className="surface min-w-0 rounded-md p-4">
            <summary className="cursor-pointer select-none text-sm font-semibold text-ink-100">高级选项：YAML 与文件路径</summary>
            <p className="mt-2 text-xs leading-5 text-ink-500">普通投稿不需要理解这里。熟悉 GitHub 的贡献者可以复制结构化数据或下载文件。</p>
            <div className="mt-4">{advancedActions}</div>
            <p className="mt-3 break-all rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-ink-300">目标文件：{generated.targetPath}</p>
            <pre className="mt-4 max-h-[36rem] max-w-full overflow-auto rounded-md border border-white/10 bg-ink-950 p-4 text-xs leading-5 text-ink-300">
              <code>{generated.yaml}</code>
            </pre>
          </details>
        </aside>
      </div>
    </div>
  );
}
