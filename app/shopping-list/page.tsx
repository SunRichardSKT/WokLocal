import { ShoppingListView } from "@/components/shopping-list-view";
import { getRecipes, getSubstitutions } from "@/lib/data";

export const metadata = {
  title: "购物清单 | 就地开饭",
  description: "把多道菜需要的食材合并成一张本地化购物清单。"
};

export default function ShoppingListPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <ShoppingListView recipes={getRecipes()} substitutions={getSubstitutions()} />
    </div>
  );
}
