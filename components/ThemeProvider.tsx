"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeCtx = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";
const ATTR = "class";
const THEMES: Theme[] = ["light", "dark", "system"];

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme(storage: string | null, fallback: Theme): Theme {
  if (storage && THEMES.includes(storage as Theme)) return storage as Theme;
  return fallback;
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.setAttribute(ATTR, resolved);
  root.style.colorScheme = resolved;
  try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
}

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  enableColorScheme?: boolean;
  storageKey?: string;
  themes?: string[];
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  // Inject script during SSR only (not rendered by React on client)
  useServerInsertedHTML(() => (
    <script
      dangerouslySetInnerHTML={{
        __html: `!function(){try{var t=localStorage.getItem("${STORAGE_KEY}")||"${defaultTheme}",r=t==="system"?matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":t;document.documentElement.classList.add(r),document.documentElement.setAttribute("${ATTR}",r),document.documentElement.style.colorScheme=r}catch(e){}}()`,
      }}
    />
  ));

  // Hydration: sync state with actual DOM + localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = getInitialTheme(stored, defaultTheme);
    setThemeState(initial);
    const resolved = initial === "system" ? getSystemTheme() : initial;
    setResolvedTheme(resolved);
    applyTheme(initial);
    setMounted(true);
  }, [defaultTheme]);

  // Listen for system theme changes
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const r = mq.matches ? "dark" : "light";
        setResolvedTheme(r);
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // Listen for storage changes from other tabs
  React.useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && THEMES.includes(e.newValue as Theme)) {
        const t = e.newValue as Theme;
        setThemeState(t);
        const resolved = t === "system" ? getSystemTheme() : t;
        setResolvedTheme(resolved);
        applyTheme(t);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
    const resolved = t === "system" ? getSystemTheme() : t;
    setResolvedTheme(resolved);
    applyTheme(t);
  }, []);

  const value = React.useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme],
  );

  return (
    <ThemeCtx.Provider value={value}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) return { theme: "light" as Theme, setTheme: () => {}, resolvedTheme: "light" as const };
  return ctx;
}
