import Link from "next/link";
import { FileText, GitPullRequestArrow, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "贡献指南 | 就地开饭",
  description: "了解如何为就地开饭贡献菜谱和地区替代食材信息。"
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <section className="py-4">
        <p className="text-sm font-medium text-scallion">Open Recipe Data</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">贡献指南</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-ink-300">
          这个项目把菜谱和本地化替代库拆开维护。新增菜谱时只引用食材 ID；补充某个地区时只更新共享替代库，所有相关菜谱都会受益。
        </p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="surface rounded-md p-4">
          <FileText className="text-scallion" size={21} aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink-100">写 YAML</h2>
          <p className="mt-2 text-sm leading-6 text-ink-300">菜谱在 `data/recipes`，替代库在 `data/substitutions`。</p>
        </div>
        <div className="surface rounded-md p-4">
          <ShieldCheck className="text-soy" size={21} aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink-100">跑校验</h2>
          <p className="mt-2 text-sm leading-6 text-ink-300">提交前运行 `npm run validate:data`，避免字段遗漏和 ID 写错。</p>
        </div>
        <div className="surface rounded-md p-4">
          <GitPullRequestArrow className="text-chili" size={21} aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink-100">发 PR</h2>
          <p className="mt-2 text-sm leading-6 text-ink-300">说明菜谱来源、测试地区和替代建议的购买依据。</p>
        </div>
      </section>

      <section className="surface mt-6 rounded-md p-5">
        <h2 className="text-xl font-semibold text-ink-100">数据约定</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-ink-100">菜谱</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              包含名称、难度、耗时、份量、标签、厨具、食材、步骤和踩坑提示。普通食材可以直接写中文名；需要本地替代的调料或特殊食材应引用共享 `ingredient_id`。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-ink-100">替代库</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              每个文件对应一个食材，按地区维护 substitute、where_to_buy、usage_note 和 similarity。英国 `uk` 是 MVP 完整示范地区。
            </p>
          </div>
        </div>
        <div className="mt-5">
          <Link className="inline-flex items-center justify-center rounded-md bg-scallion px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-scallion/90" href="/recipes/">
            查看当前示范菜谱
          </Link>
        </div>
      </section>
    </div>
  );
}
