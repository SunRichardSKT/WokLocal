import { SavedRecipesView } from "@/components/saved-recipes-view";
import { getRecipes } from "@/lib/data";

export const metadata = {
  title: "我的菜谱 | 就地开饭",
  description: "查看当前浏览器里收藏的菜谱和最近看过的菜谱。"
};

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <SavedRecipesView recipes={getRecipes()} />
    </div>
  );
}
