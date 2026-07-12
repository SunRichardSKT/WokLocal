"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

const storageKey = "woklocal-theme";

function currentTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  window.localStorage.setItem(storageKey, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label={`切换到${nextTheme === "light" ? "浅色" : "深色"}模式`}
      className="theme-toggle flex size-10 shrink-0 items-center justify-center rounded-md border border-white/10 text-ink-300 transition hover:border-scallion/50 hover:text-scallion"
      onClick={() => {
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }}
      title={nextTheme === "light" ? "切换浅色模式" : "切换深色模式"}
      type="button"
    >
      <span className="theme-toggle-icon" key={theme}>
        {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      </span>
    </button>
  );
}
