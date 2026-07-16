import { ContributionGenerator } from "@/components/contribution-generator";
import { getEquipment, getIngredients } from "@/lib/data";

export const metadata = {
  title: "我要投稿 | 就地开饭",
  description: "不用会写代码，也可以为就地开饭补充菜谱、食材替代和厨具购买经验。"
};

export default function ContributePage() {
  const ingredients = getIngredients();
  const equipmentItems = getEquipment();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="eyebrow">No-code Contribution</p>
        <h1 className="display-title mt-3 text-4xl font-semibold text-ink-100 sm:text-5xl">分享你的厨房经验</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-300">
          不需要懂代码，也不用认识 YAML。选择投稿类型，像填普通问卷一样写下你做成功的菜、靠谱替代食材或购买经验，页面会自动整理格式并保存草稿。最后可以用 GitHub 提交，也可以直接发邮件到 guyanrichard@qq.com。
        </p>
      </section>
      <ContributionGenerator ingredients={ingredients} equipmentItems={equipmentItems} />
    </div>
  );
}
