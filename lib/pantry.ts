import { createStringListStore } from "@/lib/local-list-store";

const pantryIngredients = createStringListStore("woklocal.pantryIngredientIds");

export const getPantryIngredientIds = pantryIngredients.get;
export const togglePantryIngredient = pantryIngredients.toggle;
export const clearPantryIngredients = pantryIngredients.clear;
export const subscribeToPantry = pantryIngredients.subscribe;
