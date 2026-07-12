import Link from "next/link";
import { FileText, GitPullRequestArrow, Mail, PenLine, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "上传指南 | 就地开饭",
  description: "了解如何为就地开饭上传菜谱、食材替代、厨具建议和落地清单经验。"
};

export default function AboutPage() {
  const mailtoHref =
    "mailto:guyanrichard@qq.com?subject=%E5%B0%B1%E5%9C%B0%E5%BC%80%E9%A5%AD%E6%8A%95%E7%A8%BF&body=%E6%8A%95%E7%A8%BF%E7%B1%BB%E5%9E%8B%EF%BC%9A%0A%E5%9C%B0%E5%8C%BA%EF%BC%9A%0A%E5%90%8D%E7%A7%B0%EF%BC%9A%0A%0A%E6%AD%A3%E6%96%87%EF%BC%9A%0A";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <section className="py-4">
        <p className="eyebrow">Upload Guide</p>
        <h1 className="display-title mt-3 text-4xl font-semibold text-ink-100 sm:text-5xl">上传指南</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-ink-300">
          就地开饭欢迎世界各地留子补充真实经验：一道做成功过的菜、一个当地超市能买到的替代食材、一件值得买或不值得买的厨具，或者一份刚落地时的落地清单与注意事项。
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link className="inline-flex items-center justify-center rounded-md bg-scallion px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-scallion/90" href="/contribute/">
            打开可视化贡献页
          </Link>
          <a className="inline-flex items-center justify-center rounded-md border border-white/10 px-4 py-3 text-sm font-semibold text-ink-100 hover:bg-white/[0.06]" href={mailtoHref}>
            发送邮件投稿
          </a>
        </div>
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
        <h2 className="text-xl font-semibold text-ink-100">四步上传流程</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ["1. 选择类型", "先判断你要补充的是菜谱、食材替代、厨具建议，还是落地清单与注意事项。"],
            ["2. 写真实经验", "能写多少写多少，优先写清地区、购买地点、价格、做法、替代差异和踩坑点。"],
            ["3. 生成内容", "优先去可视化贡献页填写表单，复制生成的 YAML 或 Issue 内容。落地清单也可以自由文字提交。"],
            ["4. 选择提交方式", "有 GitHub 账号就提交 Issue；没有账号就把内容发邮件到 guyanrichard@qq.com。"]
          ].map(([title, body]) => (
            <div className="rounded-md border border-white/10 bg-white/[0.035] p-4" key={title}>
              <h3 className="font-semibold text-ink-100">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-300">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface mt-6 rounded-md p-5">
        <h2 className="text-xl font-semibold text-ink-100">如何写内容</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-ink-100">菜谱</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              写清菜名、所在地区、份量、耗时、预算、需要的厨具、标准食材、步骤和新手注意点。每道菜保留标准做法，并给出当地超市能买到的替代食材、购买位置和味道差异。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-ink-100">食材替代</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              写清中文名或英文名、本地叫法、替代商品、在哪买、价格或品牌、用量差异、味道差异和相似度。只知道一条也可以提交。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-ink-100">厨具建议</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              写清厨具名称、是否必买、在哪里买、价格区间、宿舍或租房限制、没有时能用什么替代，以及适合做哪些菜。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-ink-100">落地清单与注意事项</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              写清国家或城市，可以按“今天就买、三天内补齐、有预算再买”分组，也可以自由写宿舍电器限制、附近超市选择、线上采购坑点。
            </p>
          </div>
        </div>
      </section>

      <section className="surface mt-6 rounded-md p-5">
        <h2 className="text-xl font-semibold text-ink-100">如何提交 Issue</h2>
        <p className="mt-2 text-sm leading-6 text-ink-300">适合有 GitHub 账号的同学。Issue 是公开提交记录，维护者会根据内容整理进站点数据。</p>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-ink-300 md:grid-cols-2">
          <p>1. 打开可视化贡献页，选择“新增菜谱 / 新增食材替代 / 新增厨具建议”。</p>
          <p>2. 填写你知道的信息，表单会提示哪些内容建议补充。</p>
          <p>3. 复制 YAML 或 Issue 内容，也可以直接点击“打开 Issue”。</p>
          <p>4. 标题写清类型和地区，例如“新菜谱：番茄鸡蛋面”或“英国食材替代：生抽”。</p>
          <p>5. 提交后等待维护者审核、整理和合并。</p>
          <p>6. 如果是落地清单，可直接在 Issue 正文里用自由文字补充完整经验。</p>
        </div>
        <div className="mt-5">
          <Link className="inline-flex items-center justify-center gap-2 rounded-md bg-scallion px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-scallion/90" href="/contribute/">
            <GitPullRequestArrow size={16} aria-hidden="true" />
            打开可视化贡献页
          </Link>
        </div>
      </section>

      <section className="surface mt-6 rounded-md p-5">
        <h2 className="text-xl font-semibold text-ink-100">没有 GitHub 账号怎么办</h2>
        <p className="mt-2 text-sm leading-6 text-ink-300">
          可以直接发邮件到 <a className="text-scallion hover:text-scallion/80" href="mailto:guyanrichard@qq.com">guyanrichard@qq.com</a>。邮件投稿允许自由格式，维护者会人工整理。
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-ink-100">邮件标题</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              推荐格式：就地开饭投稿 - 类型 - 地区 - 名称。例：就地开饭投稿 - 菜谱 - 英国 - 番茄鸡蛋面。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-ink-100">邮件正文</h3>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              可以粘贴可视化贡献页生成的内容，也可以直接写普通文字。建议包含地区、购买地点、价格、步骤、注意事项和图片来源说明。
            </p>
          </div>
        </div>
        <div className="mt-5">
          <a className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-4 py-3 text-sm font-semibold text-ink-100 hover:bg-white/[0.06]" href={mailtoHref}>
            <Mail size={16} aria-hidden="true" />
            发送邮件投稿
          </a>
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
          可视化贡献页已经支持落地清单。你也可以在生成的 Issue 内容里继续补充自由文字，例如路线、宿舍规则、二手平台经验。
        </p>
      </section>

      <section className="surface mt-6 rounded-md p-5">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink-100">
          <PenLine size={19} aria-hidden="true" />
          图片怎么投稿
        </h2>
        <p className="mt-3 text-sm leading-6 text-ink-300">
          图片不会直接上传到站点。为了让 GitHub Pages 上的封面和步骤图稳定显示，请在可视化贡献页选择本地图片：页面会在你的浏览器里压缩成 WebP，并给出统一文件名和发布路径。压缩过程不会把图片发到第三方服务。
        </p>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-ink-300 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-4">
            <h3 className="font-medium text-ink-100">通过 GitHub Issue</h3>
            <p className="mt-2">1. 在菜谱的“图片”区选择封面或步骤图，填写图片说明。2. 下载压缩图并复制 Issue 内容。3. 打开 Issue 后，把下载的图片直接拖进正文，再提交。维护者会把图片放进 <code className="text-scallion">public/recipe-media/</code> 并合并对应 YAML。</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-4">
            <h3 className="font-medium text-ink-100">通过邮件投稿</h3>
            <p className="mt-2">把可视化贡献页生成的内容粘进邮件正文，并把下载后的 WebP 图片作为附件发到 guyanrichard@qq.com。邮件标题可写“就地开饭投稿 - 菜谱 - 地区 - 菜名”。</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-ink-300">优先使用本人拍摄或已获得明确授权的图片；请写明来源。外部图片链接可以作为临时参考，但可能失效，站内本地图片会更可靠。</p>
      </section>
    </div>
  );
}
