import { HomePageProps } from "./types";
import "./HomePage.css";
import { useEffect, useRef, useState } from "react";
import { MuscleGroupPage } from "../MuscleGroupPage";
import { TokenResponse, useGoogleLogin } from "@react-oauth/google";

type BasicProfile = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name?: string;
  picture: string;
};

type Error = {
  error: string;
};

const isError = (obj: BasicProfile | Error): obj is Error => {
  return Object.hasOwn(obj, "error");
};

type Routine = {
  routineID: number;
  userID: string;
  routineName: string;
  icon: string;
};

type Payload = {
  userID: number;
  routines: Routine[] | null;
};

export const HomePage = (props: HomePageProps) => {
  const [currMode, setMode] = useState<"Chart" | "Exercise">("Chart");
  const [currPage, setPage] = useState<string | "Home">("Home");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [userID, setUserID] = useState<number>();
  const [routinesMap, setRoutinesMap] = useState<Record<string, Routine>>();
  const [user, setUser] =
    useState<
      Omit<TokenResponse, "error" | "error_description" | "error_uri">
    >();
  const routineNameRef = useRef<HTMLInputElement>(null);
  const routineIconRef = useRef<HTMLInputElement>(null);
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setUser(tokenResponse);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    if (user) {
      fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: "application/json",
          },
        }
      ).then(async (response) => {
        const profileOrError = await (response.json() as Promise<
          BasicProfile | Error
        >);
        if (!isError(profileOrError)) {
          const response = await fetch("http://localhost:8090/login", {
            method: "POST",
            body: JSON.stringify({
              profileID: profileOrError.id,
              firstname: profileOrError.given_name,
              lastname: profileOrError.family_name ?? "",
            }),
          });
          const payload: Payload = await response.json();
          const routines = payload.routines ?? [];
          const map: Record<string, Routine> = {};
          for (const routine of routines) map[routine.routineName] = routine;
          setRoutines(routines);
          setRoutinesMap(map);
          setUserID(payload.userID);
        } else {
          //todo handle error
        }
      });
    }
  }, [user]);

  return (
    <>
      {currPage === "Home" && (
        <>
          <main className="homepage">
            <button onClick={() => login()}>Sign in with Google 🚀</button>
            {routines.map((routine, index) => (
              <article key={index}>
                <button
                  onClick={() => {
                    setPage(routine.routineName);
                  }}
                >
                  {routine.routineName}
                </button>
              </article>
            ))}
            {userID !== undefined && (
              <article>
                <form action="#" method="post">
                  <ul>
                    <li>
                      <label htmlFor="name">Name:</label>
                      <input
                        ref={routineNameRef}
                        type="text"
                        id="name"
                        name="routine_name"
                      />
                    </li>
                    <li>
                      <label htmlFor="icon">Icon: </label>
                      <input
                        ref={routineIconRef}
                        type="text"
                        id="name"
                        name="routine_icon"
                      />
                    </li>
                    <button
                      onClick={async (event) => {
                        if (!routineIconRef.current || !routineNameRef.current)
                          return;
                        const { value: routineName } = routineNameRef.current;
                        const { value: icon } = routineIconRef.current;
                        if (!routineName)
                          return alert("Routine Name is not long enough");
                        const response = await fetch(
                          `http://127.0.0.1:8090/v1/users/${userID}/routines`,
                          {
                            method: "POST",
                            body: JSON.stringify({
                              routineName: routineNameRef.current.value,
                              icon: icon ?? "",
                            }),
                          }
                        );

                        if (response.ok) {
                          const routines: Routine[] = await response.json();
                          setRoutines(routines);
                          //todo update localstorage with routine data.
                        } else {
                          //todo handle error
                        }
                      }}
                      type="button"
                    >
                      Add Workout
                    </button>
                  </ul>
                </form>
              </article>
            )}
          </main>
          <footer className="homepage-footer">
            <div
              style={{
                textDecoration:
                  currMode === "Chart" ? "underline black solid 2px" : "none",
              }}
              onClick={() => setMode("Chart")}
            >
              Charts
            </div>
            <div
              style={{
                textDecoration:
                  currMode === "Exercise"
                    ? "underline black solid 2px"
                    : "none",
              }}
              onClick={() => setMode("Exercise")}
            >
              Excercises
            </div>
          </footer>
        </>
      )}
      {currPage !== "Home" && routinesMap !== undefined && (
        <MuscleGroupPage
          routineID={routinesMap[currPage].routineID}
          pageName={currPage}
          goBack={() => setPage("Home")}
        />
      )}
    </>
  );
};
