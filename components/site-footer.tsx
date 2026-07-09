import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-ink-950/80">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-sm leading-6 text-ink-300 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="font-medium text-ink-100">就地开饭 WokLocal</p>
          <p className="mt-1">给海外生活的新手厨房准备的开放资料站：菜谱、食材替代、厨具建议和采购清单都会持续补充。</p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Link className="text-scallion hover:text-scallion/80" href="/today/">
            今天吃什么
          </Link>
          <Link className="text-scallion hover:text-scallion/80" href="/starter/">
            落地清单
          </Link>
          <Link className="text-scallion hover:text-scallion/80" href="/contribute/">
            补充内容
          </Link>
          <Link className="text-scallion hover:text-scallion/80" href="/about/">
            上传指南
          </Link>
          <Link className="text-scallion hover:text-scallion/80" href="/ingredients/">
            食材对照
          </Link>
        </div>
      </div>
    </footer>
  );
}
