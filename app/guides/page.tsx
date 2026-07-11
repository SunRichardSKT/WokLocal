import Link from "next/link";

export const metadata = {
  title: "已合并：落地清单与新手宝典 | 就地开饭",
  description: "落地快速入门建议已合并至落地清单与新手宝典。"
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <section className="surface rounded-md p-5 sm:p-6">
        <p className="text-sm font-medium text-scallion">Page Moved</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink-100">落地宝典已合并</h1>
        <p className="mt-3 text-sm leading-6 text-ink-300">采购清单、厨房搭建建议和地区注意事项现在都在同一个页面，方便按地区一次看完。</p>
        <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-scallion px-4 py-3 text-sm font-semibold text-ink-950" href="/starter/">
          前往落地清单与宝典
        </Link>
      </section>
    </div>
  );
}
