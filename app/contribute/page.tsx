import { ContributionGenerator } from "@/components/contribution-generator";
import { getEquipment, getIngredients } from "@/lib/data";

export const metadata = {
  title: "补充内容 | 就地开饭",
  description: "不用会写代码，也可以为就地开饭补充菜谱、食材替代和厨具购买经验。"
};

export default function ContributePage() {
  const ingredients = getIngredients();
  const equipmentItems = getEquipment();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="text-sm font-medium text-scallion">No-code Contribution</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">补充内容</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-300">
          分享一道你做成功过的菜、一个靠谱替代食材，或者一条厨具购买经验。页面会帮你整理成可提交的内容草稿，不会直接上传或改动仓库。
        </p>
      </section>
      <ContributionGenerator ingredients={ingredients} equipmentItems={equipmentItems} />
    </div>
  );
}
