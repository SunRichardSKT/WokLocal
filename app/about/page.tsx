import Link from "next/link";
import { FileText, GitPullRequestArrow, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "上传指南 | 就地开饭",
  description: "了解如何为就地开饭上传菜谱、食材替代、厨具建议和落地清单经验。"
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <section className="py-4">
        <p className="text-sm font-medium text-scallion">Upload Guide</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">上传指南</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-ink-300">
          就地开饭欢迎世界各地留子补充真实经验：一道做成功过的菜、一个当地超市能买到的替代食材、一件值得买或不值得买的厨具，或者一份刚落地时的采购清单。
        </p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="surface rounded-md p-4">
          <FileText className="text-scallion" size={21} aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink-100">先写能用的信息</h2>
          <p className="mt-2 text-sm leading-6 text-ink-300">不追求专业术语，优先写清楚“买什么、去哪买、怎么做、哪里容易翻车”。</p>
        </div>
        <div className="surface rounded-md p-4">
          <ShieldCheck className="text-soy" size={21} aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink-100">用可视化贡献页</h2>
          <p className="mt-2 text-sm leading-6 text-ink-300">菜谱、食材替代和厨具建议都可以在表单里写，页面会生成可复制的提交内容。</p>
        </div>
        <div className="surface rounded-md p-4">
          <GitPullRequestArrow className="text-chili" size={21} aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink-100">落地清单可自由写</h2>
          <p className="mt-2 text-sm leading-6 text-ink-300">地区清单不必套复杂格式，按城市、超市、预算、注意事项写清楚即可。</p>
        </div>
      </section>

      <section className="surface mt-6 rounded-md p-5">
        <h2 className="text-xl font-semibold text-ink-100">推荐上传内容</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-ink-100">菜谱</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              每道菜保留标准做法，并给出当地超市能买到的替代食材、购买位置和味道差异。最好补上耗时、份量、厨具、步骤和新手注意点。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-ink-100">食材和厨具</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              欢迎补充本地叫法、常见购买地点、价格区间、味道差异和替代方案。哪怕只有一条经验，也可能帮到下一个刚落地的人。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-ink-100">落地清单</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              可以按“今天就买、三天内补齐、有预算再买”来写，也可以自由写注意事项，例如宿舍电器限制、附近超市选择、线上采购坑点。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-ink-100">地区经验</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              写清国家或城市即可，不需要一次补完整。英国之外的地区尤其欢迎从一两条可靠信息开始慢慢补齐。
            </p>
          </div>
        </div>
        <div className="mt-5">
          <Link className="inline-flex items-center justify-center rounded-md bg-scallion px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-scallion/90" href="/contribute/">
            打开可视化贡献页
          </Link>
        </div>
      </section>

      <section className="surface mt-6 rounded-md p-5">
        <h2 className="text-xl font-semibold text-ink-100">落地清单自由模板</h2>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-ink-300 md:grid-cols-2">
          <p>1. 写明地区：国家、城市、学校附近商圈都可以。</p>
          <p>2. 写明购买地点：本地超市、亚超、IKEA、Amazon 或二手平台。</p>
          <p>3. 按优先级分组：今天就买、三天内补齐、有预算再买。</p>
          <p>4. 补充注意事项：宿舍禁用电器、价格坑、替代买法、交通成本。</p>
        </div>
        <p className="mt-4 text-sm leading-6 text-ink-300">
          如果表单里暂时没有对应类型，可以先用“厨具建议”提交单条经验，或在生成的 Issue 内容里直接补充完整清单。
        </p>
      </section>
    </div>
  );
}
