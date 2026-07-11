"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clipboard, ShoppingBasket, Trash2, X } from "lucide-react";
import { RegionSelector, getStoredRegion, subscribeToRegionChange } from "@/components/region-selector";
import { clearShoppingRecipes, getShoppingRecipeIds, removeShoppingRecipe, subscribeToShoppingList } from "@/lib/shopping-list";
import { regions, type RegionKey } from "@/lib/regions";
import type { IngredientRef, Recipe, Substitution } from "@/lib/schemas";

type ShoppingListViewProps = {
  recipes: Recipe[];
  substitutions: Substitution[];
};

type IngredientEntry = {
  recipeId: string;
  recipeName: string;
  amount: string;
  optional: boolean;
  note?: string;
};

type IngredientGroup = {
  key: string;
  name: string;
  nameEn?: string;
  category: string;
  substitute?: string;
  whereToBuy?: string;
  usageNote?: string;
  entries: IngredientEntry[];
};

function ingredientKey(ingredient: IngredientRef) {
  return ingredient.ingredient_id;
}

function buildPlainText(groups: IngredientGroup[], regionName: string) {
  const lines = [`就地开饭购物清单${regionName ? `（${regionName}）` : ""}`];

  groups.forEach((group) => {
    lines.push("", `- ${group.name}${group.nameEn ? ` / ${group.nameEn}` : ""}`);
    if (group.substitute) lines.push(`  替代：${group.substitute}`);
    if (group.whereToBuy) lines.push(`  购买：${group.whereToBuy}`);
    group.entries.forEach((entry) => {
      lines.push(`  用量：${entry.amount}（${entry.recipeName}${entry.optional ? "，可选" : ""}）`);
    });
  });

  return lines.join("\n");
}

function EmptyState() {
  return (
    <section className="surface rounded-md p-6">
      <p className="text-lg font-semibold text-ink-100">购物清单还是空的</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-300">打开任意菜谱详情，点“加入购物清单”，这里会自动合并多道菜需要买的食材。</p>
      <Link className="mt-5 inline-flex items-center gap-2 rounded-md bg-scallion px-4 py-3 text-sm font-semibold text-ink-950" href="/recipes/">
        去选菜谱
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}

export function ShoppingListView({ recipes, substitutions }: ShoppingListViewProps) {
  const [recipeIds, setRecipeIds] = useState<string[]>([]);
  const [region, setRegion] = useState<RegionKey | "">("");
  const [checked, setChecked] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const recipeById = useMemo(() => new Map(recipes.map((recipe) => [recipe.id, recipe])), [recipes]);
  const substitutionById = useMemo(() => new Map(substitutions.map((item) => [item.ingredient_id, item])), [substitutions]);

  useEffect(() => {
    function refresh() {
      setRecipeIds(getShoppingRecipeIds());
    }

    refresh();
    return subscribeToShoppingList(refresh);
  }, []);

  useEffect(() => {
    setRegion(getStoredRegion());
    return subscribeToRegionChange(setRegion);
  }, []);

  const selectedRecipes = recipeIds.map((id) => recipeById.get(id)).filter((recipe): recipe is Recipe => Boolean(recipe));

  const groups = useMemo(() => {
    const grouped = new Map<string, IngredientGroup>();

    selectedRecipes.forEach((recipe) => {
      recipe.base_ingredients.forEach((ingredient) => {
        const key = ingredientKey(ingredient);
        const shared = substitutionById.get(key);
        const localized = region && shared ? shared.regions[region] : undefined;
        const current =
          grouped.get(key) ??
          ({
            key,
            name: shared?.name_zh ?? ingredient.name_zh ?? key,
            nameEn: shared?.name_en ?? ingredient.name_en,
            category: shared?.category ?? "其他",
            substitute: localized?.substitute,
            whereToBuy: localized?.where_to_buy,
            usageNote: localized?.usage_note,
            entries: []
          } satisfies IngredientGroup);

        current.entries.push({
          recipeId: recipe.id,
          recipeName: recipe.name.zh,
          amount: ingredient.amount,
          optional: ingredient.optional,
          note: ingredient.note
        });
        grouped.set(key, current);
      });
    });

    return Array.from(grouped.values()).sort((a, b) => a.category.localeCompare(b.category, "zh-CN") || a.name.localeCompare(b.name, "zh-CN"));
  }, [region, selectedRecipes, substitutionById]);

  const regionName = region ? regions[region] : "";
  const checkedCount = checked.filter((key) => groups.some((group) => group.key === key)).length;

  async function copyList() {
    await navigator.clipboard.writeText(buildPlainText(groups, regionName));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function toggleChecked(key: string) {
    setChecked((items) => (items.includes(key) ? items.filter((item) => item !== key) : [...items, key]));
  }

  return (
    <div className="space-y-5">
      <section className="surface rounded-md p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-scallion">
              <ShoppingBasket size={16} aria-hidden="true" />
              本机购物清单
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">购物清单</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-300">把想做的菜加入清单后，这里会按食材合并，并根据你选择的地区显示本地替代和购买位置。</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <RegionSelector value={region} onChange={setRegion} compact />
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-ink-100 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={groups.length === 0}
              onClick={copyList}
              type="button"
            >
              <Clipboard size={15} aria-hidden="true" />
              {copied ? "已复制" : "复制清单"}
            </button>
          </div>
        </div>
      </section>

      {selectedRecipes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
            <section className="surface rounded-md p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-ink-100">已选菜谱</h2>
                <button className="text-sm text-ink-500 hover:text-chili" onClick={clearShoppingRecipes} type="button">
                  清空
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {selectedRecipes.map((recipe) => (
                  <div className="rounded-md border border-white/10 bg-white/[0.035] p-3" key={recipe.id}>
                    <div className="flex items-start justify-between gap-2">
                      <Link className="min-w-0" href={`/recipes/${recipe.id}/`}>
                        <p className="truncate text-sm font-medium text-ink-100">{recipe.name.zh}</p>
                        <p className="mt-1 text-xs text-ink-500">{recipe.time_minutes} 分钟 · {recipe.servings} 人份</p>
                      </Link>
                      <button className="shrink-0 rounded-md p-1 text-ink-500 hover:bg-white/[0.06] hover:text-chili" onClick={() => removeShoppingRecipe(recipe.id)} type="button" aria-label={`移除 ${recipe.name.zh}`}>
                        <X size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Link className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-ink-100 hover:bg-white/[0.06]" href="/recipes/">
                继续加菜
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </section>
            <section className="surface rounded-md p-4 text-sm leading-6 text-ink-300">
              <p className="font-medium text-ink-100">采购进度</p>
              <p className="mt-1">{checkedCount}/{groups.length} 项已勾选。</p>
            </section>
          </aside>

          <section className="space-y-3">
            {groups.map((group) => {
              const isChecked = checked.includes(group.key);
              return (
                <article className={isChecked ? "rounded-md border border-scallion/25 bg-scallion/[0.07] p-4" : "surface rounded-md p-4"} key={group.key}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <label className="flex min-w-0 items-start gap-3">
                      <input className="mt-1 size-4 accent-scallion" checked={isChecked} onChange={() => toggleChecked(group.key)} type="checkbox" />
                      <span className="min-w-0">
                        <span className={isChecked ? "block font-semibold text-ink-400 line-through" : "block font-semibold text-ink-100"}>{group.name}</span>
                        {group.nameEn ? <span className="mt-0.5 block text-sm text-ink-500">{group.nameEn}</span> : null}
                      </span>
                    </label>
                    <span className="w-fit rounded-md bg-white/[0.06] px-2 py-1 text-xs text-ink-300">{group.category}</span>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {group.entries.map((entry) => (
                      <div className="rounded-md bg-white/[0.035] px-3 py-2 text-sm leading-6 text-ink-300" key={`${group.key}-${entry.recipeId}-${entry.amount}`}>
                        <span className="font-medium text-ink-100">{entry.amount}</span>
                        <span> · {entry.recipeName}</span>
                        {entry.optional ? <span className="text-ink-500"> · 可选</span> : null}
                        {entry.note ? <p className="mt-1 text-xs text-ink-500">{entry.note}</p> : null}
                      </div>
                    ))}
                  </div>

                  {region ? (
                    group.substitute ? (
                      <div className="mt-3 rounded-md border border-scallion/20 bg-scallion/[0.08] p-3 text-sm leading-6 text-ink-300">
                        <p className="font-medium text-scallion">{group.substitute}</p>
                        {group.whereToBuy ? <p className="mt-1">{group.whereToBuy}</p> : null}
                        {group.usageNote ? <p className="mt-1 text-ink-400">{group.usageNote}</p> : null}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-ink-500">暂无{regionName}购买建议，先按标准食材准备。</p>
                    )
                  ) : null}
                </article>
              );
            })}
          </section>
        </div>
      )}
    </div>
  );
}
