import Link from "next/link";
import { FileText, GitPullRequestArrow, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "关于与贡献 | 就地开饭",
  description: "了解就地开饭如何帮助海外留学生快速搭建厨房，也欢迎补充菜谱、食材替代和厨具购买经验。"
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <section className="py-4">
        <p className="text-sm font-medium text-scallion">About WokLocal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">关于就地开饭</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-ink-300">
          就地开饭希望解决一个很具体的问题：刚到国外时不知道买什么、去哪买、怎么用当地食材做出熟悉的一餐。网站目前重点整理英国场景，后续会继续补充更多地区经验。
        </p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="surface rounded-md p-4">
          <FileText className="text-scallion" size={21} aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink-100">补充菜谱</h2>
          <p className="mt-2 text-sm leading-6 text-ink-300">分享你真的做成功过的菜，尤其欢迎低油烟、低预算、宿舍友好的做法。</p>
        </div>
        <div className="surface rounded-md p-4">
          <ShieldCheck className="text-soy" size={21} aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink-100">补充购买经验</h2>
          <p className="mt-2 text-sm leading-6 text-ink-300">如果你知道某个食材在 Tesco、Lidl、亚超或线上中超怎么买，可以直接补充。</p>
        </div>
        <div className="surface rounded-md p-4">
          <GitPullRequestArrow className="text-chili" size={21} aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink-100">不用会写代码</h2>
          <p className="mt-2 text-sm leading-6 text-ink-300">可视化贡献页会帮你生成内容草稿，复制或提交 Issue 即可。</p>
        </div>
      </section>

      <section className="surface mt-6 rounded-md p-5">
        <h2 className="text-xl font-semibold text-ink-100">我们想收集什么</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-ink-100">菜谱</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              最好写清楚份量、耗时、需要的厨具、食材用量、步骤和容易失败的地方。重点不是专业，而是新手照着能做出来。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-ink-100">食材和厨具</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              欢迎补充本地叫法、常见购买地点、价格区间、味道差异和替代方案。哪怕只有一条经验，也可能帮到下一个刚落地的人。
            </p>
          </div>
        </div>
        <div className="mt-5">
          <Link className="inline-flex items-center justify-center rounded-md bg-scallion px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-scallion/90" href="/contribute/">
            去补充内容
          </Link>
        </div>
      </section>
    </div>
  );
}
