"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, MapPin, ShoppingBasket, Star, Utensils, Video } from "lucide-react";
import { RegionSelector, getStoredRegion, subscribeToRegionChange } from "@/components/region-selector";
import { scenarioLabelMap } from "@/lib/recommendations";
import { regions, type RegionKey } from "@/lib/regions";
import type { Recipe, Substitution } from "@/lib/schemas";

type RecipeDetailProps = {
  recipe: Recipe;
  substitutions: Record<string, Substitution>;
};

function similarityLabel(score: number) {
  if (score >= 5) return "几乎一致";
  if (score === 4) return "很接近";
  if (score === 3) return "可接受";
  return "差异明显";
}

export function RecipeDetail({ recipe, substitutions }: RecipeDetailProps) {
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="space-y-5">
          <section className="py-3">
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
                    <p className="leading-7 text-ink-100">{step.instruction}</p>
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
