import { ContributionGenerator } from "@/components/contribution-generator";
import { getEquipment, getIngredients } from "@/lib/data";

export const metadata = {
  title: "可视化贡献 | 就地开饭",
  description: "通过表单生成菜谱、食材替代和厨具建议 YAML，并提交到 GitHub Issue。"
};

export default function ContributePage() {
  const ingredients = getIngredients();
  const equipmentItems = getEquipment();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="text-sm font-medium text-scallion">No-code Contribution</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">可视化贡献</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-300">
          这里不会直接上传或改动仓库，只帮你把内容整理成标准 YAML 和 GitHub Issue 文本。复制、下载或打开 Issue 后，维护者再审核整理。
        </p>
      </section>
      <ContributionGenerator ingredients={ingredients} equipmentItems={equipmentItems} />
    </div>
  );
}
