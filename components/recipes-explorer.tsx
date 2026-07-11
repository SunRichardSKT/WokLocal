"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, Flame, Search, SlidersHorizontal, Star } from "lucide-react";
import { RecipeCover } from "@/components/recipe-cover";
import { scenarioLabelMap } from "@/lib/recommendations";
import type { Recipe } from "@/lib/schemas";

type RecipesExplorerProps = {
  recipes: Recipe[];
  cuisines: string[];
  tags: string[];
  recipeTypes: string[];
};

function difficultyText(level: number) {
  return level <= 1 ? "入门" : level === 2 ? "简单" : level === 3 ? "进阶" : "挑战";
}

const recipeTypeLabels: Record<string, string> = {
  chinese: "中餐",
  fusion: "融合菜",
  local_adapted: "本地改造"
};

export function RecipesExplorer({ recipes, cuisines, tags, recipeTypes }: RecipesExplorerProps) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [time, setTime] = useState("all");
  const [cuisine, setCuisine] = useState("all");
  const [tag, setTag] = useState("all");
  const [recipeType, setRecipeType] = useState("all");

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const matchesQuery =
        !normalizedQuery ||
        [recipe.name.zh, recipe.name.en, recipe.name.pinyin, recipe.description, recipe.cuisine, ...recipe.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesDifficulty = difficulty === "all" || recipe.difficulty <= Number(difficulty);
      const matchesTime = time === "all" || recipe.time_minutes <= Number(time);
      const matchesCuisine = cuisine === "all" || recipe.cuisine === cuisine;
      const matchesTag = tag === "all" || recipe.tags.includes(tag);
      const matchesType = recipeType === "all" || recipe.recipe_type === recipeType;

      return matchesQuery && matchesDifficulty && matchesTime && matchesCuisine && matchesTag && matchesType;
    });
  }, [recipes, query, difficulty, time, cuisine, tag, recipeType]);

  return (
    <div className="space-y-5">
      <section className="surface rounded-md p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))]">
          <label className="relative col-span-2 block md:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={18} aria-hidden="true" />
            <input
              className="control w-full pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索菜名、标签、口味"
              aria-label="搜索菜谱"
            />
          </label>
          <select className="control w-full" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} aria-label="按难度筛选">
            <option value="all">全部难度</option>
            <option value="1">入门以内</option>
            <option value="2">简单以内</option>
            <option value="3">进阶以内</option>
          </select>
          <select className="control w-full" value={time} onChange={(event) => setTime(event.target.value)} aria-label="按耗时筛选">
            <option value="all">全部耗时</option>
            <option value="15">15 分钟内</option>
            <option value="25">25 分钟内</option>
            <option value="35">35 分钟内</option>
          </select>
          <select className="control w-full" value={cuisine} onChange={(event) => setCuisine(event.target.value)} aria-label="按菜系筛选">
            <option value="all">全部菜系</option>
            {cuisines.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="control w-full" value={tag} onChange={(event) => setTag(event.target.value)} aria-label="按标签筛选">
            <option value="all">全部标签</option>
            {tags.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="control w-full" value={recipeType} onChange={(event) => setRecipeType(event.target.value)} aria-label="按类型筛选">
            <option value="all">全部类型</option>
            {recipeTypes.map((item) => (
              <option value={item} key={item}>
                {recipeTypeLabels[item] ?? item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="flex items-center gap-2 text-sm text-ink-300">
        <SlidersHorizontal size={16} aria-hidden="true" />
        <span>找到 {filteredRecipes.length} 道菜</span>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {filteredRecipes.map((recipe) => (
          <Link href={`/recipes/${recipe.id}/`} className="surface group rounded-md p-4 transition hover:border-scallion/40" key={recipe.id}>
            <RecipeCover recipe={recipe} className="mb-4 aspect-[16/8]" compact />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-ink-100">{recipe.name.zh}</h2>
                <p className="mt-1 truncate text-sm text-ink-300">{recipe.name.en}</p>
              </div>
              <span className="max-w-28 shrink-0 truncate rounded-md bg-scallion/[0.15] px-2 py-1 text-xs font-medium text-scallion">{recipe.cuisine}</span>
            </div>
            <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-ink-300">{recipe.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="pill">
                <Flame size={13} aria-hidden="true" />
                {difficultyText(recipe.difficulty)}
              </span>
              <span className="pill">
                <Clock3 size={13} aria-hidden="true" />
                {recipe.time_minutes} 分钟
              </span>
              <span className="pill">
                <Star size={13} aria-hidden="true" />
                {recipe.servings} 人份
              </span>
              <span className="pill">预算 {recipe.budget_level === "low" ? "低" : recipe.budget_level === "medium" ? "中" : "高"}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {recipe.tags.slice(0, 4).map((item) => (
                <span className="rounded-full bg-white/[0.04] px-2 py-1 text-xs text-ink-300" key={item}>
                  {item}
                </span>
              ))}
              {recipe.scenarios.slice(0, 2).map((scenario) => (
                <span className="rounded-full bg-scallion/[0.08] px-2 py-1 text-xs text-scallion" key={scenario}>
                  {scenarioLabelMap[scenario]}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
