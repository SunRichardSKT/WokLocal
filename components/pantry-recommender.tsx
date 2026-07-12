"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Search, ShoppingBasket, X } from "lucide-react";
import { clearPantryIngredients, getPantryIngredientIds, subscribeToPantry, togglePantryIngredient } from "@/lib/pantry";
import { isRecipeInShoppingList, subscribeToShoppingList, toggleShoppingRecipe } from "@/lib/shopping-list";
import type { Recipe, Substitution } from "@/lib/schemas";

type PantryRecommenderProps = {
  ingredients: Substitution[];
  recipes: Recipe[];
};

type RecipeMatch = {
  recipe: Recipe;
  matchedIds: string[];
  missingIds: string[];
  totalRequired: number;
};

function includesQuery(ingredient: Substitution, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [
    ingredient.name_zh,
    ingredient.name_en,
    ingredient.pinyin ?? "",
    ingredient.category,
    ...ingredient.aliases_zh,
    ...ingredient.aliases_en,
    ...ingredient.aliases_pinyin,
    ...ingredient.search_keywords,
    ...ingredient.common_uses
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function recipeMatch(recipe: Recipe, selectedIds: Set<string>): RecipeMatch {
  const requiredIds = Array.from(new Set(recipe.base_ingredients.filter((ingredient) => !ingredient.optional).map((ingredient) => ingredient.ingredient_id)));
  const matchedIds = requiredIds.filter((id) => selectedIds.has(id));

  return {
    recipe,
    matchedIds,
    missingIds: requiredIds.filter((id) => !selectedIds.has(id)),
    totalRequired: requiredIds.length
  };
}

function matchLabel(match: RecipeMatch) {
  if (match.missingIds.length === 0) return "食材齐了";
  if (match.missingIds.length === 1) return "只差 1 样";
  return `还差 ${match.missingIds.length} 样`;
}

function ShoppingListButton({ recipeId }: { recipeId: string }) {
  const [inList, setInList] = useState(false);

  useEffect(() => {
    const refresh = () => setInList(isRecipeInShoppingList(recipeId));
    refresh();
    return subscribeToShoppingList(refresh);
  }, [recipeId]);

  return (
    <button
      aria-pressed={inList}
      className={
        inList
          ? "inline-flex items-center justify-center gap-2 rounded-md border border-soy/50 bg-soy/[0.16] px-3 py-2 text-sm font-semibold text-soy"
          : "inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-ink-100 transition hover:bg-white/[0.08]"
      }
      onClick={() => setInList(toggleShoppingRecipe(recipeId))}
      type="button"
    >
      <ShoppingBasket size={15} aria-hidden="true" />
      {inList ? "已加购" : "加入购物清单"}
    </button>
  );
}

export function PantryRecommender({ ingredients, recipes }: PantryRecommenderProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const refresh = () => setSelectedIds(getPantryIngredientIds());
    refresh();
    return subscribeToPantry(refresh);
  }, []);

  const ingredientById = useMemo(() => new Map(ingredients.map((ingredient) => [ingredient.ingredient_id, ingredient])), [ingredients]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const searchResults = useMemo(() => ingredients.filter((ingredient) => !selectedSet.has(ingredient.ingredient_id) && includesQuery(ingredient, query)).slice(0, 10), [ingredients, query, selectedSet]);
  const selectedIngredients = selectedIds.map((id) => ingredientById.get(id)).filter((ingredient): ingredient is Substitution => Boolean(ingredient));
  const matches = useMemo(
    () =>
      recipes
        .map((recipe) => recipeMatch(recipe, selectedSet))
        .sort((a, b) => {
          const aRatio = a.totalRequired ? a.matchedIds.length / a.totalRequired : 0;
          const bRatio = b.totalRequired ? b.matchedIds.length / b.totalRequired : 0;
          if (bRatio !== aRatio) return bRatio - aRatio;
          if (a.missingIds.length !== b.missingIds.length) return a.missingIds.length - b.missingIds.length;
          return a.recipe.time_minutes - b.recipe.time_minutes;
        }),
    [recipes, selectedSet]
  );

  const readyMatches = matches.filter((match) => match.totalRequired > 0 && match.missingIds.length === 0);
  const nearMatches = matches.filter((match) => match.matchedIds.length > 0 && match.missingIds.length > 0).slice(0, 6);
  const visibleMatches = readyMatches.length > 0 ? readyMatches.slice(0, 6) : nearMatches;

  function removeIngredient(id: string) {
    togglePantryIngredient(id);
  }

  return (
    <div className="space-y-5">
      <section className="surface rounded-md p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-100">我的现有食材</p>
            <p className="mt-1 text-sm leading-6 text-ink-300">只选择真正已经在手边的主食材和调料。选择会保存在这台浏览器中。</p>
          </div>
          {selectedIngredients.length > 0 ? (
            <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-ink-300 transition hover:bg-white/[0.06] hover:text-chili" onClick={clearPantryIngredients} type="button">
              <X size={15} aria-hidden="true" />
              清空
            </button>
          ) : null}
        </div>

        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={18} aria-hidden="true" />
          <input className="control w-full pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索已有食材，例如鸡蛋、soy sauce、shengchou" aria-label="搜索已有食材" />
        </label>
        {query.trim() ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {searchResults.map((ingredient) => (
              <button className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-left transition hover:border-scallion/40 hover:bg-white/[0.06]" key={ingredient.ingredient_id} onClick={() => togglePantryIngredient(ingredient.ingredient_id)} type="button">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink-100">{ingredient.name_zh}</span>
                  <span className="block truncate text-xs text-ink-500">{ingredient.name_en}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-scallion">添加</span>
              </button>
            ))}
            {searchResults.length === 0 ? <p className="px-1 py-2 text-sm text-ink-500">没有找到对应食材，试试中文、英文、拼音或别名。</p> : null}
          </div>
        ) : null}

        {selectedIngredients.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedIngredients.map((ingredient) => (
              <button className="inline-flex max-w-full items-center gap-1 rounded-md border border-scallion/35 bg-scallion/[0.1] px-2.5 py-1.5 text-sm text-scallion transition hover:bg-scallion/[0.18]" key={ingredient.ingredient_id} onClick={() => removeIngredient(ingredient.ingredient_id)} type="button" title="点击移除">
                <Check size={14} aria-hidden="true" />
                <span className="truncate">{ingredient.name_zh}</span>
                <X size={13} aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-white/15 px-3 py-4 text-sm leading-6 text-ink-500">先在上方搜索并点选食材。比如从“鸡蛋、米饭、生抽”开始，结果会更贴近你此刻的厨房。</div>
        )}
      </section>

      {selectedIngredients.length > 0 ? (
        <section>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-ink-100">{readyMatches.length > 0 ? "现在就能做" : "最接近能做的菜"}</h2>
              <p className="mt-1 text-sm text-ink-300">{readyMatches.length > 0 ? `已有 ${readyMatches.length} 道菜的必需食材齐全。` : "补齐缺失食材后，就可以开做。"}</p>
            </div>
            <Link className="inline-flex items-center gap-1 text-sm font-medium text-scallion" href="/ingredients/">查食材替代 <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          {visibleMatches.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleMatches.map((match) => {
                const missingIngredients = match.missingIds.map((id) => ingredientById.get(id)?.name_zh ?? id);
                return (
                  <article className="surface surface-interactive rounded-md p-4" key={match.recipe.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-ink-100">{match.recipe.name.zh}</h3>
                        <p className="mt-1 truncate text-sm text-ink-300">{match.recipe.name.en}</p>
                      </div>
                      <span className={match.missingIds.length === 0 ? "shrink-0 rounded-md bg-scallion/[0.15] px-2 py-1 text-xs font-medium text-scallion" : "shrink-0 rounded-md bg-white/[0.06] px-2 py-1 text-xs text-ink-300"}>{matchLabel(match)}</span>
                    </div>
                    <p className="mt-3 text-sm text-ink-300">已有 {match.matchedIds.length}/{match.totalRequired} 样必需食材</p>
                    {missingIngredients.length > 0 ? <p className="mt-2 min-h-12 text-sm leading-6 text-ink-500">还缺：{missingIngredients.join("、")}</p> : <p className="mt-2 min-h-12 text-sm leading-6 text-scallion">食材备齐，可以直接开做。</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link className="inline-flex items-center justify-center gap-2 rounded-md bg-scallion px-3 py-2 text-sm font-semibold text-ink-950" href={`/recipes/${match.recipe.id}/`}>看做法 <ArrowRight size={15} aria-hidden="true" /></Link>
                      {match.missingIds.length > 0 ? <ShoppingListButton recipeId={match.recipe.id} /> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <section className="surface rounded-md p-5 text-sm leading-6 text-ink-300">暂时没有可匹配的菜。再补充两三种手头食材，或直接浏览全部菜谱。</section>}
        </section>
      ) : null}
    </div>
  );
}
