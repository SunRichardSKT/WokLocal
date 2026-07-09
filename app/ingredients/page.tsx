import { IngredientsExplorer } from "@/components/ingredients-explorer";
import { getIngredients } from "@/lib/data";

export const metadata = {
  title: "食材对照表 | 就地开饭",
  description: "查询中国大陆食材和调料在海外地区的本土替代、购买位置和使用差异。"
};

export default function IngredientsPage() {
  const ingredients = getIngredients();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="text-sm font-medium text-scallion">Ingredient Atlas</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">食材对照表</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-300">输入中国大陆食材、调料名称或英文货架名，查看各地区能买到的替代品和味道差异。</p>
      </section>
      <IngredientsExplorer ingredients={ingredients} />
    </div>
  );
}
