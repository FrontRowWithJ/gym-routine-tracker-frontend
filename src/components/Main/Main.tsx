import "./Main.css";
import { RoutinePage } from "@/components/RoutinePage";
import { Page } from "@/misc";
import { LoginMenu } from "@/components/LoginMenu";
import { useToggle, useUserState, isUserLoggedIn } from "@/misc/hooks";
import { useTheme } from "@/components/ThemeContextProvider";
import { Button } from "@/components/Button";
import { Chart, Home, Workout, Dark, Light } from "@/resources/SVG";
import { useState } from "react";

const ThemeButton = () => {
  const [theme, setTheme] = useTheme();
  return (
    <Button onClick={setTheme} className="theme-button">
      <Dark translate={theme === "dark" ? "0 0" : "0 150%"} />
      <Light translate={theme === "dark" ? "0 150%" : "0 0"} />
    </Button>
  );
};

const ModeButton = () => {
  const [mode, setMode] = useToggle("Workout", "Chart");
  return (
    <Button onClick={() => setMode()}>
      {mode === "Chart" ? <Chart /> : <Workout />}
    </Button>
  );
};

const animateBackground = (direction: "forwards" | "reverse") => {
  const controller = new AbortController();
  const classNames = ["domain-expansion", `animate-${direction}`];
  document.body.addEventListener(
    "animationend",
    () => {
      document.body.classList.remove(...classNames);
      controller.abort();
    },
    { signal: controller.signal },
  );
  document.body.classList.add(...classNames);
};

const useHomeButton = () => {
  const [{ page, pageName }, setState] = useState<{
    page: Page;
    pageName: string;
  }>({
    page: "Routine",
    pageName: "Trackout",
  });
  const setPageAndPageName = (pageName: string) => {
    setState((currState) => {
      if (currState.pageName === pageName) return currState;
      animateBackground(page === "Routine" ? "forwards" : "reverse");
      return {
        page: pageName === "Trackout" ? "Routine" : "Workout",
        pageName,
      };
    });
  };
  const HomeButton = () => (
    <Button onClick={() => setPageAndPageName("Trackout")}>
      <Home />
    </Button>
  );
  return [{ page, pageName, setPageAndPageName }, HomeButton] as const;
};

export const Main = () => {
  const [userID, setUserID] = useUserState();
  const isLoggedIn = isUserLoggedIn(userID);
  const [{ page, pageName, setPageAndPageName }, HomeButton] = useHomeButton();
  return (
    <main className="main-page">
      <nav>
        <HomeButton />
        <ModeButton />
        <span>{pageName}</span>
        <ThemeButton />
        <LoginMenu {...{ isLoggedIn, setUserID, userID }} />
      </nav>
      {<RoutinePage {...{ page, userID, setPageAndPageName }} />}
    </main>
  );
};
