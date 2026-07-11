import { createStringListStore } from "@/lib/local-list-store";

const shoppingList = createStringListStore("woklocal.shoppingRecipeIds");

export function getShoppingRecipeIds() {
  return shoppingList.get();
}

export function isRecipeInShoppingList(recipeId: string) {
  return shoppingList.has(recipeId);
}

export function toggleShoppingRecipe(recipeId: string) {
  return shoppingList.toggle(recipeId);
}

export function removeShoppingRecipe(recipeId: string) {
  shoppingList.set(getShoppingRecipeIds().filter((id) => id !== recipeId));
}

export function clearShoppingRecipes() {
  shoppingList.clear();
}

export function subscribeToShoppingList(callback: () => void) {
  return shoppingList.subscribe(callback);
}
