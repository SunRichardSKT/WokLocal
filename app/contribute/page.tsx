import { ContributionGenerator } from "@/components/contribution-generator";

export const metadata = {
  title: "可视化贡献 | 就地开饭",
  description: "通过表单生成菜谱、食材替代和厨具建议 YAML，并提交到 GitHub Issue。"
};

export default function ContributePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="text-sm font-medium text-scallion">No-code Contribution</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">可视化贡献</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-300">不用懂代码也可以先把内容写成标准 YAML。复制后发 Issue，维护者再整理成 PR。</p>
      </section>
      <ContributionGenerator />
    </div>
  );
}
