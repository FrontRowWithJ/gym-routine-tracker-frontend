import "./Main.css";
import { useState } from "react";
import { MainProps } from "./types";
import { HomeLink } from "@/components/HomeLink";
import { RoutinePage } from "@/components/RoutinePage";
import { Page } from "@/misc";
import { Divider } from "@/components/Divider";
import { SettingsMenu } from "@/components/SettingsMenu";
import { LoginMenu } from "@/components/LoginMenu";
import { LogoutButton } from "@/components/LogoutButton";
import { ChartOrWorkoutButton } from "@/components/ChartOrWorkoutButton";
import { useUserState } from "@/misc/hooks";

export const Main = (props: MainProps) => {
  const [currPage, setPage] = useState<Page>("Routine");
  const [mode, setMode] = useState<"Chart" | "Workout">("Workout");
  const [{ userID, isLoggedIn }, setUserID] = useUserState();
  return (
    <main className="main-page">
      <nav>
        <HomeLink
          setPage={() => setPage("Routine")}
          page={currPage}
          titleName={currPage}
        />
        <ChartOrWorkoutButton
          mode={mode}
          toggleMode={() => setMode(mode === "Chart" ? "Workout" : "Chart")}
        />
        <span>{currPage}</span>
        <SettingsMenu isLoggedIn={isLoggedIn} userID={userID} />
        {isLoggedIn ? <LogoutButton /> : <LoginMenu setUserID={setUserID} />}
      </nav>
      <Divider style={{ marginBottom: "1rem" }} width="100%" margin=".5rem" />
      <RoutinePage page={currPage} setPage={setPage} userID={userID} />
    </main>
  );
};
