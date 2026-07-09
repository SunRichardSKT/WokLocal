import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-ink-950/80">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-sm leading-6 text-ink-300 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="font-medium text-ink-100">就地开饭 WokLocal</p>
          <p className="mt-1">纯静态 GitHub Pages 站点。提交内容前请运行 `npm run validate:data` 和 `npm run build`。</p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Link className="text-scallion hover:text-scallion/80" href="/today/">
            今天吃什么
          </Link>
          <Link className="text-scallion hover:text-scallion/80" href="/starter/">
            第一周清单
          </Link>
          <Link className="text-scallion hover:text-scallion/80" href="/contribute/">
            可视化贡献
          </Link>
          <Link className="text-scallion hover:text-scallion/80" href="/about/">
            贡献指南
          </Link>
          <Link className="text-scallion hover:text-scallion/80" href="/ingredients/">
            食材对照
          </Link>
        </div>
      </div>
    </footer>
  );
}
