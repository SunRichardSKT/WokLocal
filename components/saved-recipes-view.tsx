"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, History, Heart, Trash2 } from "lucide-react";
import { RecipeCover } from "@/components/recipe-cover";
import { RecipeSaveButton } from "@/components/recipe-memory-actions";
import { clearRecentRecipes, getFavoriteRecipeIds, getRecentRecipeIds, subscribeToRecipeMemory } from "@/lib/recipe-memory";
import type { Recipe } from "@/lib/schemas";

type SavedRecipesViewProps = {
  recipes: Recipe[];
};

function difficultyText(level: number) {
  return level <= 1 ? "入门" : level === 2 ? "简单" : level === 3 ? "进阶" : "挑战";
}

function RecipeMiniCard({ recipe, removable = false }: { recipe: Recipe; removable?: boolean }) {
  return (
    <div className="surface rounded-md p-4 transition hover:border-scallion/40">
      <Link href={`/recipes/${recipe.id}/`} className="block">
        <RecipeCover recipe={recipe} className="mb-4 aspect-[16/8]" compact />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-ink-100">{recipe.name.zh}</h3>
            <p className="mt-1 truncate text-sm text-ink-300">{recipe.name.en}</p>
          </div>
          <span className="shrink-0 rounded-md bg-white/[0.06] px-2 py-1 text-xs text-ink-300">{difficultyText(recipe.difficulty)}</span>
        </div>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-ink-300">{recipe.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="pill">
            <Clock3 size={13} aria-hidden="true" />
            {recipe.time_minutes} 分钟
          </span>
          <span className="pill">{recipe.cuisine}</span>
          <span className="pill">预算 {recipe.budget_level === "low" ? "低" : recipe.budget_level === "medium" ? "中" : "高"}</span>
        </div>
      </Link>
      {removable ? (
        <div className="mt-4">
          <RecipeSaveButton recipeId={recipe.id} compact />
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-dashed border-white/15 bg-white/[0.025] p-5">
      <p className="font-semibold text-ink-100">{title}</p>
      <p className="mt-2 text-sm leading-6 text-ink-300">{body}</p>
      <Link className="mt-4 inline-flex items-center gap-2 rounded-md bg-scallion px-4 py-2 text-sm font-semibold text-ink-950" href="/recipes/">
        去找菜谱
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function SavedRecipesView({ recipes }: SavedRecipesViewProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const recipeById = useMemo(() => new Map(recipes.map((recipe) => [recipe.id, recipe])), [recipes]);

  useEffect(() => {
    function refresh() {
      setFavoriteIds(getFavoriteRecipeIds());
      setRecentIds(getRecentRecipeIds());
    }

    refresh();
    return subscribeToRecipeMemory(refresh);
  }, []);

  const favoriteRecipes = favoriteIds.map((id) => recipeById.get(id)).filter((recipe): recipe is Recipe => Boolean(recipe));
  const recentRecipes = recentIds.map((id) => recipeById.get(id)).filter((recipe): recipe is Recipe => Boolean(recipe));

  return (
    <div className="space-y-6">
      <section className="surface rounded-md p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-scallion">
              <Heart size={16} aria-hidden="true" />
              本机保存
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">我的菜谱</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-300">收藏和最近看过只保存在当前浏览器里，不需要登录，也不会上传到服务器。</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-center">
              <p className="text-lg font-semibold text-ink-100">{favoriteRecipes.length}</p>
              <p className="text-ink-500">收藏</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-center">
              <p className="text-lg font-semibold text-ink-100">{recentRecipes.length}</p>
              <p className="text-ink-500">最近看过</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-ink-100">
            <Heart className="text-scallion" size={18} aria-hidden="true" />
            收藏的菜
          </h2>
        </div>
        {favoriteRecipes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">{favoriteRecipes.map((recipe) => <RecipeMiniCard recipe={recipe} removable key={recipe.id} />)}</div>
        ) : (
          <EmptyState title="还没有收藏" body="打开任意菜谱详情，点“收藏这道菜”，它就会出现在这里。" />
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-ink-100">
            <History className="text-soy" size={18} aria-hidden="true" />
            最近看过
          </h2>
          {recentRecipes.length > 0 ? (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-ink-300 transition hover:bg-white/[0.06]"
              onClick={clearRecentRecipes}
              type="button"
            >
              <Trash2 size={15} aria-hidden="true" />
              清空记录
            </button>
          ) : null}
        </div>
        {recentRecipes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">{recentRecipes.map((recipe) => <RecipeMiniCard recipe={recipe} key={recipe.id} />)}</div>
        ) : (
          <EmptyState title="还没有浏览记录" body="从菜谱列表打开几道菜，这里会自动保留最近看过的内容。" />
        )}
      </section>
    </div>
  );
}
