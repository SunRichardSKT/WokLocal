import { GuidesView } from "@/components/guides-view";
import { getGuides } from "@/lib/data";

export const metadata = {
  title: "落地快速入门宝典 | 就地开饭",
  description: "按地区整理留学生落地后搭建厨房、购买厨具和食材的快速入门清单。"
};

export default function GuidesPage() {
  const guides = getGuides();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="text-sm font-medium text-scallion">Starter Guide</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">落地快速入门宝典</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-300">到达后的前 48 小时，先把做饭环境搭起来：买什么、去哪买、哪些先不用急。</p>
      </section>
      <GuidesView guides={guides} />
    </div>
  );
}
