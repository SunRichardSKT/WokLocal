"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Shuffle, Star } from "lucide-react";
import { scenarioDefinitions, scenarioLabelMap } from "@/lib/recommendations";
import type { Recipe, RecommendationScenario } from "@/lib/schemas";

type TodayRecommenderProps = {
  recipes: Recipe[];
};

function scoreRecipe(recipe: Recipe, selected: RecommendationScenario[]) {
  if (selected.length === 0) {
    return 0;
  }
  return selected.reduce((score, scenario) => score + (recipe.scenarios.includes(scenario) ? 1 : 0), 0);
}

function reasonFor(recipe: Recipe, selected: RecommendationScenario[]) {
  const matched = selected.filter((scenario) => recipe.scenarios.includes(scenario)).map((scenario) => scenarioLabelMap[scenario]);
  if (matched.length > 0) {
    return `匹配：${matched.join("、")}`;
  }
  if (recipe.time_minutes <= 15) {
    return "虽然不是完全匹配，但它足够快。";
  }
  return "作为备选，步骤和食材都比较稳。";
}

export function TodayRecommender({ recipes }: TodayRecommenderProps) {
  const [selected, setSelected] = useState<RecommendationScenario[]>(["quick_15"]);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const shuffleTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (shuffleTimer.current !== null) window.clearTimeout(shuffleTimer.current);
    };
  }, []);

  const ranked = useMemo(() => {
    return recipes
      .map((recipe) => ({ recipe, score: scoreRecipe(recipe, selected) }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.recipe.time_minutes !== b.recipe.time_minutes) return a.recipe.time_minutes - b.recipe.time_minutes;
        return a.recipe.difficulty - b.recipe.difficulty;
      });
  }, [recipes, selected]);

  const topMatches = ranked.filter((item) => item.score > 0);
  const fallback = ranked.slice(0, 3);
  const visible = topMatches.length > 0 ? topMatches : fallback;
  const pick = visible[shuffleSeed % visible.length]?.recipe;

  function toggleScenario(id: RecommendationScenario) {
    setShuffleSeed(0);
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function shuffleRecipe() {
    if (isShuffling || visible.length <= 1) return;
    setIsShuffling(true);
    shuffleTimer.current = window.setTimeout(() => {
      setShuffleSeed((value) => value + 1);
      setIsShuffling(false);
      shuffleTimer.current = null;
    }, 280);
  }

  return (
    <div className="space-y-5">
      <section className="surface rounded-md p-4">
        <p className="text-sm font-medium text-ink-100">先选今天的情况</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {scenarioDefinitions.map((scenario) => {
            const Icon = scenario.icon;
            const active = selected.includes(scenario.id);
            return (
              <button
                className={
                  active
                    ? "rounded-md border border-scallion bg-scallion/[0.16] p-3 text-left"
                    : "rounded-md border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-scallion/40"
                }
                key={scenario.id}
                onClick={() => toggleScenario(scenario.id)}
                type="button"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-ink-100">
                  <Icon className={active ? "text-scallion" : "text-ink-500"} size={17} aria-hidden="true" />
                  {scenario.label}
                </span>
                <span className="mt-2 block text-xs leading-5 text-ink-300">{scenario.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      {pick ? (
        <div className="recipe-deck">
          <div className="recipe-deck-layer recipe-deck-layer-back" aria-hidden="true" />
          <div className="recipe-deck-layer recipe-deck-layer-mid" aria-hidden="true" />
          <section
            className={`surface recipe-deck-card rounded-md p-5 ${isShuffling ? "recipe-deck-card-exit" : ""}`}
            key={`${pick.id}-${shuffleSeed}`}
          >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-scallion">今天可以吃</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-ink-100">{pick.name.zh}</h2>
              <p className="mt-1 text-sm text-ink-300">{pick.name.en}</p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-300">{pick.description}</p>
              <p className="mt-3 text-sm text-soy">{reasonFor(pick, selected)}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-4 py-3 text-sm font-semibold text-ink-100 transition hover:border-scallion/40 hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-60"
                disabled={isShuffling || visible.length <= 1}
                onClick={shuffleRecipe}
                type="button"
              >
                <Shuffle className={isShuffling ? "animate-spin" : ""} size={16} aria-hidden="true" />
                {isShuffling ? "切牌中" : "换一个"}
              </button>
              <Link className="inline-flex items-center justify-center gap-2 rounded-md bg-scallion px-4 py-3 text-sm font-semibold text-ink-950" href={`/recipes/${pick.id}/`}>
                看做法
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
              <Clock3 className="mb-2 text-scallion" size={18} aria-hidden="true" />
              <p className="text-ink-300">耗时</p>
              <p className="mt-1 font-semibold text-ink-100">{pick.time_minutes} 分钟</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
              <Star className="mb-2 text-soy" size={18} aria-hidden="true" />
              <p className="text-ink-300">难度</p>
              <p className="mt-1 font-semibold text-ink-100">{pick.difficulty}/5</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
              <span className="mb-2 block text-lg text-chili">£</span>
              <p className="text-ink-300">预算</p>
              <p className="mt-1 font-semibold text-ink-100">{pick.budget_level === "low" ? "低" : pick.budget_level === "medium" ? "中" : "高"}</p>
            </div>
          </div>
          </section>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        {visible.slice(0, 6).map(({ recipe, score }) => (
          <Link className="surface surface-interactive rounded-md p-4" href={`/recipes/${recipe.id}/`} key={recipe.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink-100">{recipe.name.zh}</h2>
                <p className="mt-1 text-sm text-ink-300">{recipe.name.en}</p>
              </div>
              <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs text-ink-300">{score > 0 ? `${score} 项匹配` : "备选"}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-300">{reasonFor(recipe, selected)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="pill">{recipe.time_minutes} 分钟</span>
              <span className="pill">难度 {recipe.difficulty}/5</span>
              <span className="pill">{recipe.cuisine}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
