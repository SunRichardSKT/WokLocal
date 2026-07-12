import { assetPath } from "@/lib/assets";
import type { Recipe } from "@/lib/schemas";

type RecipeCoverProps = {
  recipe: Recipe;
  className?: string;
  compact?: boolean;
};

const typeAccent: Record<Recipe["recipe_type"], string> = {
  chinese: "border-chili/30",
  fusion: "border-scallion/30",
  local_adapted: "border-soy/35"
};

export function RecipeCover({ recipe, className = "", compact = false }: RecipeCoverProps) {
  if (recipe.cover_image) {
    return (
      <figure className={`relative overflow-hidden rounded-md border border-white/10 bg-ink-900 ${className}`}>
        <img className="h-full w-full object-cover" src={assetPath(recipe.cover_image.src)} alt={recipe.cover_image.alt} loading={compact ? "lazy" : "eager"} />
        <figcaption className="absolute bottom-0 left-0 right-0 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-black/75 px-3 py-2 text-xs text-white/80 backdrop-blur">
          <span>{recipe.cover_image.caption ?? recipe.name.zh}</span>
          {recipe.cover_image.credit ? (
            recipe.cover_image.credit_url ? (
              <a className="truncate underline decoration-white/30 underline-offset-2 transition hover:text-white" href={recipe.cover_image.credit_url} rel="noreferrer" target="_blank">
                {recipe.cover_image.credit}
              </a>
            ) : <span className="truncate">{recipe.cover_image.credit}</span>
          ) : null}
        </figcaption>
      </figure>
    );
  }

  return (
    <div className={`cover-motion relative overflow-hidden rounded-md border bg-ink-850 ${typeAccent[recipe.recipe_type]} ${className}`}>
      <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(135deg,transparent_0_47%,rgba(255,255,255,0.055)_47%_48%,transparent_48%_100%)]" />
      <div className="absolute left-0 top-0 h-full w-1 bg-current text-scallion [border-left:1px_solid_rgba(255,255,255,0.12)]" />
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
