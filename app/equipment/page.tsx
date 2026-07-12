import { EquipmentBoard } from "@/components/equipment-board";
import { getEquipment } from "@/lib/data";

export const metadata = {
  title: "厨具库 | 就地开饭",
  description: "留学生厨房必买厨具、可选升级和宿舍替代方案。"
};

export default function EquipmentPage() {
  const equipment = getEquipment();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <section className="mb-6">
        <p className="eyebrow">Kitchen Setup</p>
        <h1 className="display-title mt-3 text-4xl font-semibold text-ink-100 sm:text-5xl">厨具库</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-300">先买能解决 80% 做饭需求的基础件，再根据宿舍规则和预算升级。</p>
      </section>
      <EquipmentBoard equipment={equipment} />
    </div>
  );
}
