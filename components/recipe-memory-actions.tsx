"use client";

import { useEffect, useState } from "react";
import { Heart, ShoppingBasket } from "lucide-react";
import { isFavoriteRecipe, recordRecentRecipe, subscribeToRecipeMemory, toggleFavoriteRecipe } from "@/lib/recipe-memory";
import { isRecipeInShoppingList, subscribeToShoppingList, toggleShoppingRecipe } from "@/lib/shopping-list";

type RecipeSaveButtonProps = {
  recipeId: string;
  className?: string;
  compact?: boolean;
};

export function RecipeSaveButton({ recipeId, className = "", compact = false }: RecipeSaveButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isFavoriteRecipe(recipeId));
    return subscribeToRecipeMemory(() => setSaved(isFavoriteRecipe(recipeId)));
  }, [recipeId]);

  return (
    <button
      aria-pressed={saved}
      className={
        className ||
        (saved
          ? "inline-flex items-center justify-center gap-2 rounded-md border border-scallion/50 bg-scallion/[0.16] px-4 py-3 text-sm font-semibold text-scallion transition hover:bg-scallion/[0.22]"
          : "inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-ink-100 transition hover:bg-white/[0.08]")
      }
      onClick={() => setSaved(toggleFavoriteRecipe(recipeId))}
      type="button"
    >
      <Heart className={saved ? "fill-current" : ""} size={compact ? 15 : 16} aria-hidden="true" />
      {compact ? (saved ? "已收藏" : "收藏") : saved ? "已收藏这道菜" : "收藏这道菜"}
    </button>
  );
}

export function RecipeViewTracker({ recipeId }: { recipeId: string }) {
  useEffect(() => {
    recordRecentRecipe(recipeId);
  }, [recipeId]);

  return null;
}

export function RecipeShoppingButton({ recipeId }: { recipeId: string }) {
  const [inList, setInList] = useState(false);

  useEffect(() => {
    setInList(isRecipeInShoppingList(recipeId));
    return subscribeToShoppingList(() => setInList(isRecipeInShoppingList(recipeId)));
  }, [recipeId]);

  return (
    <button
      aria-pressed={inList}
      className={
        inList
          ? "inline-flex items-center justify-center gap-2 rounded-md border border-soy/50 bg-soy/[0.16] px-4 py-3 text-sm font-semibold text-soy transition hover:bg-soy/[0.22]"
          : "inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-ink-100 transition hover:bg-white/[0.08]"
      }
      onClick={() => setInList(toggleShoppingRecipe(recipeId))}
      type="button"
    >
      <ShoppingBasket size={16} aria-hidden="true" />
      {inList ? "已加入购物清单" : "加入购物清单"}
    </button>
  );
}
