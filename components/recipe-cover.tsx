import type { Recipe } from "@/lib/schemas";

type RecipeCoverProps = {
  recipe: Recipe;
  className?: string;
  compact?: boolean;
};

const typeAccent: Record<Recipe["recipe_type"], string> = {
  chinese: "from-chili/45 via-ink-800 to-ink-950",
  fusion: "from-scallion/35 via-ink-800 to-ink-950",
  local_adapted: "from-soy/35 via-ink-800 to-ink-950"
};

export function RecipeCover({ recipe, className = "", compact = false }: RecipeCoverProps) {
  if (recipe.cover_image) {
    return (
      <figure className={`relative overflow-hidden rounded-md border border-white/10 bg-ink-900 ${className}`}>
        <img className="h-full w-full object-cover" src={recipe.cover_image.src} alt={recipe.cover_image.alt} loading={compact ? "lazy" : "eager"} />
        <figcaption className="absolute bottom-0 left-0 right-0 bg-ink-950/70 px-3 py-2 text-xs text-ink-300 backdrop-blur">
          {recipe.cover_image.caption ?? recipe.name.zh}
        </figcaption>
      </figure>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-md border border-white/10 bg-gradient-to-br ${typeAccent[recipe.recipe_type]} ${className}`}>
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_18%_18%,rgba(238,241,245,0.12),transparent_22%),linear-gradient(135deg,transparent_0_35%,rgba(255,255,255,0.07)_35%_36%,transparent_36%_100%)]" />
      <div className="relative flex h-full min-h-28 flex-col justify-between p-3">
        <span className="w-fit rounded-md bg-ink-950/75 px-2 py-1 text-xs text-ink-300">{recipe.cuisine}</span>
        <div>
          <p className={compact ? "text-lg font-semibold text-ink-100" : "text-2xl font-semibold text-ink-100"}>{recipe.name.zh}</p>
          <p className="mt-1 text-sm text-ink-300">{recipe.name.en}</p>
        </div>
      </div>
    </div>
  );
}
