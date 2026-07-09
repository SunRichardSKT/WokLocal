"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, MapPin, ShoppingBasket, Star, Utensils, Video } from "lucide-react";
import { RecipeCover } from "@/components/recipe-cover";
import { RegionSelector, getStoredRegion, subscribeToRegionChange } from "@/components/region-selector";
import { scenarioLabelMap } from "@/lib/recommendations";
import { regions, type RegionKey } from "@/lib/regions";
import type { Equipment, Recipe, RecipeStep, Substitution } from "@/lib/schemas";

type RecipeDetailProps = {
  recipe: Recipe;
  substitutions: Record<string, Substitution>;
  equipment: Record<string, Equipment>;
};

function similarityLabel(score: number) {
  if (score >= 5) return "几乎一致";
  if (score === 4) return "很接近";
  if (score === 3) return "可接受";
  return "差异明显";
}

function imageSrcLabel(src: string) {
  return src.startsWith("/") ? src : "外部图片";
}

type HighlightInfo = {
  type: "ingredient" | "equipment";
  id: string;
  label: string;
  title: string;
  subtitle?: string;
  body: string;
  meta?: string;
};

type HighlightCandidate = {
  type: "ingredient" | "equipment";
  id: string;
  label: string;
  explicit?: boolean;
};

function uniqueLabels(values: Array<string | undefined>) {
  const seen = new Set<string>();
  return values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function splitEquipmentName(value: string) {
  return value
    .split(/[、,，/和或\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isUsefulAutoLabel(label: string) {
  if (/^[\u4e00-\u9fff]+$/.test(label)) {
    return label.length >= 2;
  }

  return label.length >= 3;
}

function instructionIncludes(instruction: string, label: string) {
  return instruction.toLowerCase().includes(label.toLowerCase());
}

function renderHighlightedInstruction(instruction: string, highlights: HighlightInfo[]) {
  if (highlights.length === 0) {
    return instruction;
  }

  const sortedHighlights = [...highlights].sort((a, b) => b.label.length - a.label.length);
  const parts: Array<string | HighlightInfo> = [];
  let cursor = 0;

  while (cursor < instruction.length) {
    const match = sortedHighlights
      .map((highlight) => ({ highlight, index: instruction.toLowerCase().indexOf(highlight.label.toLowerCase(), cursor) }))
      .filter((item) => item.index >= 0)
      .sort((a, b) => a.index - b.index || b.highlight.label.length - a.highlight.label.length)[0];

    if (!match) {
      parts.push(instruction.slice(cursor));
      break;
    }

    if (match.index > cursor) {
      parts.push(instruction.slice(cursor, match.index));
    }

    parts.push(match.highlight);
    cursor = match.index + match.highlight.label.length;
  }

  return parts.map((part, index) => {
    if (typeof part === "string") {
      return <span key={`text-${index}`}>{part}</span>;
    }

    return <StepHighlight highlight={part} key={`${part.type}-${part.id}-${index}`} />;
  });
}

function StepHighlight({ highlight }: { highlight: HighlightInfo }) {
  return (
    <span className="group relative inline-flex">
      <span className="cursor-help rounded bg-scallion/[0.16] px-1 py-0.5 text-scallion underline decoration-scallion/50 decoration-dotted underline-offset-4">
        {highlight.label}
      </span>
      <span className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-72 rounded-md border border-white/10 bg-ink-950 p-3 text-left text-sm leading-6 text-ink-300 shadow-soft group-hover:block group-focus-within:block">
        <span className="block font-semibold text-ink-100">{highlight.title}</span>
        {highlight.subtitle ? <span className="mt-1 block text-xs text-ink-500">{highlight.subtitle}</span> : null}
        <span className="mt-2 block">{highlight.body}</span>
        {highlight.meta ? <span className="mt-2 block text-xs text-ink-500">{highlight.meta}</span> : null}
      </span>
    </span>
  );
}

export function RecipeDetail({ recipe, substitutions, equipment }: RecipeDetailProps) {
  const [region, setRegion] = useState<RegionKey | "">("");

  useEffect(() => {
    setRegion(getStoredRegion());
    return subscribeToRegionChange(setRegion);
  }, []);

  const regionName = region ? regions[region] : "";

  const localizedIngredients = useMemo(
    () =>
      recipe.base_ingredients.map((ingredient) => {
        const shared = substitutions[ingredient.ingredient_id];
        const localized = region && shared ? shared.regions[region] : undefined;
        return {
          ingredient,
          shared,
          localized,
          name: shared?.name_zh ?? ingredient.name_zh ?? ingredient.ingredient_id,
          nameEn: shared?.name_en ?? ingredient.name_en
        };
      }),
    [recipe.base_ingredients, region, substitutions]
  );

  const ingredientLookup = useMemo(() => {
    return new Map(localizedIngredients.map((item) => [item.ingredient.ingredient_id, item]));
  }, [localizedIngredients]);

  const autoHighlightCandidates = useMemo<HighlightCandidate[]>(() => {
    const ingredientCandidates = localizedIngredients.flatMap(({ ingredient, shared, name, nameEn }) => {
      const labels = uniqueLabels([
        name,
        ingredient.name_zh,
        shared?.name_zh,
        nameEn,
        ingredient.name_en,
        shared?.name_en,
        ...(shared?.aliases_zh ?? []),
        ...(shared?.aliases_en ?? [])
      ]).filter(isUsefulAutoLabel);

      return labels.map((label) => ({ type: "ingredient" as const, id: ingredient.ingredient_id, label }));
    });

    const equipmentCandidates = recipe.equipment.required_ids.flatMap((equipmentId, index) => {
      const item = equipment[equipmentId];
      const recipeName = recipe.equipment.required[index];
      const labels = uniqueLabels([item?.name_zh, item?.name_en, recipeName, ...splitEquipmentName(recipeName ?? "")]).filter(isUsefulAutoLabel);

      return labels.map((label) => ({ type: "equipment" as const, id: equipmentId, label }));
    });

    return [...ingredientCandidates, ...equipmentCandidates];
  }, [equipment, localizedIngredients, recipe.equipment.required, recipe.equipment.required_ids]);

  function buildHighlightInfo(candidate: HighlightCandidate): HighlightInfo {
    if (candidate.type === "ingredient") {
      const ingredient = ingredientLookup.get(candidate.id);
      const shared = substitutions[candidate.id];
      const localized = region && shared ? shared.regions[region] : undefined;
      const title = ingredient?.name ?? shared?.name_zh ?? candidate.id;
      const body = localized
        ? `${localized.substitute}；${localized.where_to_buy}`
        : region && shared
          ? `暂无${regionName}本地替代建议，可先按标准食材准备。`
          : "这是菜谱里的临时食材，暂无共享替代库信息。";

      return {
        type: "ingredient",
        id: candidate.id,
        label: candidate.label,
        title,
        subtitle: ingredient?.nameEn ?? shared?.name_en,
        body,
        meta: localized ? `相似度 ${localized.similarity}/5，${similarityLabel(localized.similarity)}` : undefined
      };
    }

    const item = equipment[candidate.id];
    const localized = region && item ? item.regions[region] : undefined;
    const title = item?.name_zh ?? candidate.label ?? candidate.id;
    const body = localized
      ? `${localized.where_to_buy}；参考价格 ${localized.price_range}`
      : item
        ? item.substitutes_if_missing.length > 0
          ? `没有也可以用：${item.substitutes_if_missing.join("、")}`
          : "暂无该地区购买建议。"
        : "暂无厨具库信息。";

    return {
      type: "equipment",
      id: candidate.id,
      label: candidate.label,
      title,
      subtitle: item?.name_en,
      body,
      meta: localized?.notes
    };
  }

  function getStepHighlights(step: RecipeStep): HighlightInfo[] {
    const explicitCandidates: HighlightCandidate[] = step.highlights.map((highlight) => {
      if (highlight.label) {
        return { type: highlight.type, id: highlight.id, label: highlight.label, explicit: true };
      }

      if (highlight.type === "ingredient") {
        const ingredient = ingredientLookup.get(highlight.id);
        const shared = substitutions[highlight.id];
        return { type: highlight.type, id: highlight.id, label: ingredient?.name ?? shared?.name_zh ?? highlight.id, explicit: true };
      }

      const item = equipment[highlight.id];
      return { type: highlight.type, id: highlight.id, label: item?.name_zh ?? highlight.id, explicit: true };
    });
    const autoCandidates = autoHighlightCandidates.filter((candidate) => instructionIncludes(step.instruction, candidate.label));
    const candidates = [...explicitCandidates, ...autoCandidates];
    const seen = new Set<string>();

    return candidates
      .filter((candidate) => instructionIncludes(step.instruction, candidate.label))
      .filter((candidate) => {
        const key = `${candidate.type}-${candidate.id}-${candidate.label.toLowerCase()}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .map((candidate) => buildHighlightInfo(candidate));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="space-y-5">
          <section className="py-3">
            <RecipeCover recipe={recipe} className="mb-5 aspect-[16/9] min-h-64" />
            <div className="flex flex-wrap gap-2 text-sm text-ink-300">
              <span className="pill">{recipe.cuisine}</span>
              <span className="pill">预算 {recipe.budget_level === "low" ? "低" : recipe.budget_level === "medium" ? "中" : "高"}</span>
              {recipe.scenarios.slice(0, 3).map((scenario) => (
                <span className="pill" key={scenario}>
                  {scenarioLabelMap[scenario]}
                </span>
              ))}
              {recipe.tags.slice(0, 4).map((tagItem) => (
                <span className="pill" key={tagItem}>
                  {tagItem}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">{recipe.name.zh}</h1>
            <p className="mt-2 text-base text-ink-300">{recipe.name.en}</p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink-300">{recipe.description}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
              <div className="surface rounded-md p-3">
                <Clock3 className="mb-2 text-scallion" size={18} aria-hidden="true" />
                <p className="text-ink-300">耗时</p>
                <p className="mt-1 font-semibold text-ink-100">{recipe.time_minutes} 分钟</p>
              </div>
              <div className="surface rounded-md p-3">
                <Star className="mb-2 text-soy" size={18} aria-hidden="true" />
                <p className="text-ink-300">难度</p>
                <p className="mt-1 font-semibold text-ink-100">{recipe.difficulty}/5</p>
              </div>
              <div className="surface rounded-md p-3">
                <Utensils className="mb-2 text-chili" size={18} aria-hidden="true" />
                <p className="text-ink-300">份量</p>
                <p className="mt-1 font-semibold text-ink-100">{recipe.servings} 人份</p>
              </div>
            </div>
          </section>

          <section className="surface rounded-md p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink-100">食材与本地替代</h2>
                <p className="mt-1 text-sm leading-6 text-ink-300">
                  {region ? `正在显示 ${regionName} 的购买建议。` : "选择地区后显示当地超市可买到的替代方案。"}
                </p>
              </div>
              <RegionSelector value={region} onChange={setRegion} compact />
            </div>

            <div className="mt-4 space-y-3">
              {localizedIngredients.map(({ ingredient, shared, localized, name, nameEn }) => (
                <div className="rounded-md border border-white/10 bg-white/[0.035] p-3" key={`${ingredient.ingredient_id}-${ingredient.amount}`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-ink-100">
                        {name}
                        {ingredient.optional ? <span className="ml-2 text-xs text-ink-500">可选</span> : null}
                      </p>
                      {nameEn ? <p className="mt-0.5 text-sm text-ink-500">{nameEn}</p> : null}
                      {ingredient.note ? <p className="mt-1 text-sm text-ink-300">{ingredient.note}</p> : null}
                    </div>
                    <p className="shrink-0 rounded-md bg-ink-800 px-2 py-1 text-sm text-ink-100">{ingredient.amount}</p>
                  </div>

                  {!region ? null : localized ? (
                    <div className="mt-3 rounded-md border border-scallion/20 bg-scallion/[0.08] p-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-scallion">
                        <ShoppingBasket size={15} aria-hidden="true" />
                        <span>{localized.substitute}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-ink-300">{localized.where_to_buy}</p>
                      {localized.usage_note ? <p className="mt-2 text-sm leading-6 text-ink-300">{localized.usage_note}</p> : null}
                      <p className="mt-2 text-xs text-ink-500">相似度 {localized.similarity}/5，{similarityLabel(localized.similarity)}</p>
                    </div>
                  ) : shared ? (
                    <div className="mt-3 flex gap-2 rounded-md border border-chili/20 bg-chili/[0.08] p-3 text-sm leading-6 text-ink-300">
                      <AlertTriangle className="mt-1 shrink-0 text-chili" size={15} aria-hidden="true" />
                      <span>暂无{regionName}的本地化建议，欢迎在 GitHub 提交。</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="surface rounded-md p-4">
            <h2 className="text-lg font-semibold text-ink-100">步骤</h2>
            {recipe.video_links.length > 0 ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {recipe.video_links.map((link) => (
                  <a
                    className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-ink-100 transition hover:border-scallion/40"
                    href={link.url}
                    key={`${link.platform}-${link.url}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="flex items-center gap-2">
                      <Video className="shrink-0 text-scallion" size={16} aria-hidden="true" />
                      {link.platform === "bilibili" ? "去 Bilibili 看视频" : link.title}
                    </span>
                    <ExternalLink className="shrink-0 text-ink-500" size={15} aria-hidden="true" />
                  </a>
                ))}
              </div>
            ) : null}
            <ol className="mt-4 space-y-4">
              {recipe.steps.map((step) => (
                <li className="grid gap-3 sm:grid-cols-[2.5rem_minmax(0,1fr)]" key={step.order}>
                  <span className="flex size-9 items-center justify-center rounded-md bg-scallion text-sm font-bold text-ink-950">{step.order}</span>
                  <div>
                    <p className="leading-7 text-ink-100">{renderHighlightedInstruction(step.instruction, getStepHighlights(step))}</p>
                    {step.image ? (
                      <figure className="mt-3 overflow-hidden rounded-md border border-white/10 bg-white/[0.035]">
                        <img className="h-auto w-full object-cover" src={step.image.src} alt={step.image.alt} loading="lazy" />
                        <figcaption className="flex flex-col gap-1 px-3 py-2 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
                          <span>{step.image.caption ?? step.image.alt}</span>
                          <span>{step.image.credit ?? imageSrcLabel(step.image.src)}</span>
                        </figcaption>
                      </figure>
                    ) : null}
                    {step.tip ? <p className="mt-2 rounded-md bg-white/[0.04] px-3 py-2 text-sm leading-6 text-ink-300">{step.tip}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="surface rounded-md p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-100">
              <MapPin size={18} aria-hidden="true" />
              厨具
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-300">
              {recipe.equipment.required.map((item) => (
                <li className="flex gap-2" key={item}>
                  <CheckCircle2 className="mt-1 shrink-0 text-scallion" size={15} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {recipe.equipment.substitutes_if_missing ? (
              <p className="mt-3 rounded-md bg-white/[0.04] px-3 py-2 text-sm leading-6 text-ink-300">{recipe.equipment.substitutes_if_missing}</p>
            ) : null}
          </section>

          <section className="surface rounded-md p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-100">
              <AlertTriangle size={18} aria-hidden="true" />
              新手踩坑
            </h2>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-ink-300">
              {recipe.common_mistakes.map((mistake) => (
                <li className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2" key={mistake}>
                  {mistake}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
