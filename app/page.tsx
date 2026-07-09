import Link from "next/link";
import { ArrowRight, ClipboardList, Clock3, Flame, ShoppingBasket, Sparkles, Wrench, Wheat } from "lucide-react";
import { RegionAwarePanel } from "@/components/region-aware-panel";
import { getEquipment, getIngredients, getRecipes } from "@/lib/data";

export default function HomePage() {
  const recipes = getRecipes();
  const ingredients = getIngredients();
  const equipment = getEquipment();
  const featured = recipes.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div className="py-4">
          <p className="text-sm font-medium text-scallion">海外生活厨房指南</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-ink-100 sm:text-5xl">就地开饭 WokLocal</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink-300">
            给留学生、交换生和刚搬到国外的人用。这里整理了快手菜谱、当地超市替代食材、基础厨具和第一周采购清单，帮你用买得到的东西先把饭做起来。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex items-center justify-center gap-2 rounded-md bg-scallion px-4 py-3 text-sm font-semibold text-ink-950 transition hover:bg-scallion/90" href="/recipes/">
              看菜谱
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="inline-flex items-center justify-center gap-2 rounded-md border border-scallion/40 bg-scallion/[0.12] px-4 py-3 text-sm font-semibold text-scallion transition hover:bg-scallion/[0.18]" href="/today/">
              今天吃什么
              <Sparkles size={16} aria-hidden="true" />
            </Link>
            <Link className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-ink-100 transition hover:bg-white/[0.08]" href="/about/">
              了解项目
            </Link>
          </div>
        </div>

        <RegionAwarePanel />
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link href="/starter/" className="surface rounded-md p-4 transition hover:border-scallion/40">
          <ClipboardList className="text-scallion" size={20} aria-hidden="true" />
          <p className="mt-3 text-2xl font-semibold text-ink-100">第一周清单</p>
          <p className="mt-1 text-sm leading-6 text-ink-300">按优先级买厨具、调料和基础食材。</p>
        </Link>
        <Link href="/ingredients/" className="surface rounded-md p-4 transition hover:border-scallion/40">
          <Wheat className="text-scallion" size={20} aria-hidden="true" />
          <p className="mt-3 text-2xl font-semibold text-ink-100">食材对照</p>
          <p className="mt-1 text-sm leading-6 text-ink-300">输入中文、英文或拼音，查当地可以买到的替代品。</p>
        </Link>
        <Link href="/equipment/" className="surface rounded-md p-4 transition hover:border-scallion/40">
          <Wrench className="text-soy" size={20} aria-hidden="true" />
          <p className="mt-3 text-2xl font-semibold text-ink-100">厨具清单</p>
          <p className="mt-1 text-sm leading-6 text-ink-300">先买必需品，再考虑升级件。</p>
        </Link>
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-3">
        <Link href="/guides/" className="surface rounded-md p-4 transition hover:border-scallion/40">
          <ShoppingBasket className="text-scallion" size={20} aria-hidden="true" />
          <p className="mt-3 text-2xl font-semibold text-ink-100">英国</p>
          <p className="mt-1 text-sm leading-6 text-ink-300">当前重点覆盖英国，包含常见英超与亚超购买场景。</p>
        </Link>
        <div className="surface rounded-md p-4">
          <Clock3 className="text-soy" size={20} aria-hidden="true" />
          <p className="mt-3 text-2xl font-semibold text-ink-100">12-28</p>
          <p className="mt-1 text-sm leading-6 text-ink-300">分钟级快手菜，适合课后和宿舍厨房。</p>
        </div>
        <div className="surface rounded-md p-4">
          <Flame className="text-chili" size={20} aria-hidden="true" />
          <p className="mt-3 text-2xl font-semibold text-ink-100">{recipes.length}</p>
          <p className="mt-1 text-sm leading-6 text-ink-300">道可直接照做的菜谱，另有 {ingredients.length} 个食材和 {equipment.length} 个厨具条目。</p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-ink-100">精选菜谱</h2>
            <p className="mt-1 text-sm text-ink-300">先从高成功率的家常菜开始。</p>
          </div>
          <Link className="hidden items-center gap-1 text-sm font-medium text-scallion sm:flex" href="/recipes/">
            全部菜谱
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((recipe) => (
            <Link className="surface group rounded-md p-4 transition hover:border-scallion/40" href={`/recipes/${recipe.id}/`} key={recipe.id}>
              <div className="h-28 rounded-md border border-white/10 bg-[linear-gradient(135deg,#151820,#2a303c_52%,#0f1115)] p-3">
                <span className="rounded-md bg-ink-950/75 px-2 py-1 text-xs text-ink-300">{recipe.cuisine}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink-100">{recipe.name.zh}</h3>
              <p className="mt-1 text-sm text-ink-300">{recipe.name.en}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="pill">{recipe.time_minutes} 分钟</span>
                <span className="pill">难度 {recipe.difficulty}/5</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
