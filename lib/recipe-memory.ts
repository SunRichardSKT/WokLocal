import { createStringListStore } from "@/lib/local-list-store";

const favoriteRecipes = createStringListStore("woklocal.favoriteRecipeIds");
const recentRecipes = createStringListStore("woklocal.recentRecipeIds", { limit: 20 });

export function getFavoriteRecipeIds() {
  return favoriteRecipes.get();
}

export function isFavoriteRecipe(recipeId: string) {
  return favoriteRecipes.has(recipeId);
}

export function toggleFavoriteRecipe(recipeId: string) {
  return favoriteRecipes.toggle(recipeId);
}

export function getRecentRecipeIds() {
  return recentRecipes.get();
}

export function recordRecentRecipe(recipeId: string) {
  recentRecipes.prepend(recipeId);
}

export function clearRecentRecipes() {
  recentRecipes.clear();
}

export function subscribeToRecipeMemory(callback: () => void) {
  return favoriteRecipes.subscribe(callback);
}
