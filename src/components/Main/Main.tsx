import "./Main.css";
import { RoutinePage } from "@/components/RoutinePage";
import { animateBackground, isUserLoggedIn } from "@/misc";
import { LoginMenu } from "@/components/LoginMenu";
import { useToggle, useUserState } from "@/misc/hooks";
import { useTheme } from "@/components/ThemeContextProvider";
import { Button } from "@/components/Button";
import { Chart, Home, Workout, Dark, Light } from "@/resources/SVG";

const Favicon = () => {
  const [theme] = useTheme();
  const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
  link.href = `/favicon-${theme}.ico`;
  return null;
};

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

export const Main = () => {
  const [page, setPage] = useToggle("Routine", "Workout");
  const [userID, setUserID] = useUserState();
  const isLoggedIn = isUserLoggedIn(userID);
  return (
    <>
      <Favicon />
      <main className="main-page">
        <div className="background"></div>
        <nav>
          <Button
            onClick={() => {
              setPage("Routine");
              if (page === "Workout") animateBackground("reverse");
            }}
          >
            <Home />
          </Button>
          <ModeButton />
          <span>Trackout</span>
          <ThemeButton />
          <LoginMenu {...{ isLoggedIn, setUserID, userID }} />
        </nav>
        {<RoutinePage {...{ page, setPage, userID }} />}
      </main>
    </>
  );
};
