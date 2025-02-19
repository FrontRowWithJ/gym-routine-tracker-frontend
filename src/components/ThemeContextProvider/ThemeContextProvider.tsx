import { ThemeContextProviderProps } from "./types";
import { Theme, NOOP } from "@/misc";
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";

const MATCH_MEDIA_QUERY = "(prefers-color-scheme: dark)";

const getTheme = (): Theme => {
  const theme = window.matchMedia(MATCH_MEDIA_QUERY).matches ? "dark" : "light";
  return localStorage.getItem("theme") ?? theme;
};

const _useTheme = () => {
  const [theme, _setTheme] = useState<Theme>(getTheme());
  const setTheme = useCallback(
    (newTheme?: Theme) => {
      const t = newTheme ?? (theme === "dark" ? "light" : "dark");
      _setTheme(t);
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("theme", t);
    },
    [theme]
  );
  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      "storage",
      ({ newValue, key }) => {
        if (key === "theme" && (newValue === "dark" || newValue === "light"))
          setTheme(newValue);
      },
      { signal: controller.signal }
    );
    window
      .matchMedia(MATCH_MEDIA_QUERY)
      .addEventListener(
        "change",
        (e) => setTheme(e.matches ? "dark" : "light"),
        { signal: controller.signal }
      );
    return () => controller.abort();
  }, [setTheme]);
  return [theme, () => setTheme()] as const;
};

const ThemeContext = createContext<readonly [Theme, () => void]>([
  "dark",
  NOOP,
]);
export const ThemeContextProvider = (props: ThemeContextProviderProps) => {
  return (
    <ThemeContext.Provider value={_useTheme()}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
