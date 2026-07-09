import { CheckCircle2, MapPin, WalletCards } from "lucide-react";
import { regions } from "@/lib/regions";
import type { StarterPack } from "@/lib/schemas";

type StarterPackViewProps = {
  packs: StarterPack[];
};

const priorityLabels: Record<StarterPack["sections"][number]["priority"], string> = {
  today: "今天就买",
  three_days: "三天内补齐",
  optional: "有预算再买"
};

export function StarterPackView({ packs }: StarterPackViewProps) {
  if (packs.length === 0) {
    return <section className="surface rounded-md p-5 text-sm text-ink-300">暂无第一周采购清单。</section>;
  }

  return (
    <div className="space-y-5">
      {packs.map((pack) => (
        <article className="space-y-5" key={pack.pack_id}>
          <section className="surface rounded-md p-5">
            <p className="text-sm font-medium text-scallion">{regions[pack.region as keyof typeof regions]}</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink-100">{pack.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-300">{pack.summary}</p>
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            {pack.sections.map((section) => (
              <section className="surface rounded-md p-4" key={section.priority}>
                <h3 className="text-lg font-semibold text-ink-100">{priorityLabels[section.priority]}</h3>
                <p className="mt-1 text-sm text-ink-500">{section.title}</p>
                <div className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3" key={`${section.priority}-${item.name}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-ink-100">{item.name}</p>
                          <p className="mt-1 text-xs text-ink-500">{item.category}</p>
                        </div>
                        <span className="rounded-md bg-scallion/[0.12] px-2 py-1 text-xs text-scallion">{item.estimated_budget}</span>
                      </div>
                      <p className="mt-3 flex gap-2 text-sm leading-6 text-ink-300">
                        <MapPin className="mt-1 shrink-0 text-soy" size={15} aria-hidden="true" />
                        <span>{item.where_to_buy.join(" / ")}</span>
                      </p>
                      {item.note ? (
                        <p className="mt-2 flex gap-2 text-sm leading-6 text-ink-300">
                          <CheckCircle2 className="mt-1 shrink-0 text-scallion" size={15} aria-hidden="true" />
                          <span>{item.note}</span>
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      ))}

      <section className="surface rounded-md p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-100">
          <WalletCards size={18} aria-hidden="true" />
          使用建议
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-300">
          第一周别追求厨具一步到位。先保证能煮饭、煮面、煎蛋、做盖饭，再根据自己做饭频率补升级件。
        </p>
      </section>
    </div>
  );
}
