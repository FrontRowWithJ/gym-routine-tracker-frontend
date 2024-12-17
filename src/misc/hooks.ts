import { useState, useEffect } from "react";
import {
  getTheme,
  getWorkoutsLS,
  setWorkoutLS,
  setWorkoutsLS,
  deleteWorkoutLS,
  getRoutinesLS,
  setRoutineLS,
  deleteRoutineLS,
  setRoutinesLS,
  isUserLoggedIn,
  parseToken,
} from "./util";
import {
  Exact,
  JWTPayload,
  Prettify,
  RoutineData,
  Theme,
  WorkoutData,
} from "./types";
import { MATCH_MEDIA_QUERY, OFFLINE_USER_ID, ORIGIN } from "./constants";
import { debounce, fetchWrapper } from "./fetchHandler";

export const useTheme = () => {
  const [theme, _setTheme] = useState<Theme>(getTheme());

  useEffect(() => {
    const handleStorage = ({ newValue, key }: StorageEvent) => {
      if (key === "theme" && (newValue === "dark" || newValue === "light"))
        setTheme(newValue);
    };
    window.addEventListener("storage", handleStorage);

    const handleChange = (e: MediaQueryListEvent) =>
      setTheme(e.matches ? "dark" : "light");
    const media = window.matchMedia(MATCH_MEDIA_QUERY);
    media.addEventListener("change", handleChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      media.removeEventListener("change", handleChange);
    };
  }, []);

  const setTheme = (theme: Theme) => {
    _setTheme(theme);
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };
  return [theme, setTheme] as const;
};

export const useWorkouts = (userID: number, routineID: number) => {
  const [workouts, setWorkouts] = useState(getWorkoutsLS(routineID));
  useEffect(() => {
    if (isUserLoggedIn(userID)) {
      fetchWrapper<WorkoutData[]>(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts`,
        {
          retries: 3,
          responseType: "JSON",
          method: "GET",
        }
      ).then(({ data: workouts, error }) => {
        if (error !== null) {
          // TODO handle error
        } else {
          setWorkoutsLS(workouts);
          setWorkouts(workouts);
        }
      });
    }
  }, [userID, routineID]);

  const postWorkout = async (
    workout: Prettify<
      Omit<WorkoutData, "workoutID" | "routineID" | "indexNumber">
    >
  ) => {
    if (isUserLoggedIn(userID)) {
      const { data, error } = await fetchWrapper<WorkoutData>(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts`,
        {
          retries: 3,
          responseType: "JSON",
          method: "POST",
          body: JSON.stringify(workout),
        }
      );
      if (error !== null) {
        // TODO handle error
      } else {
        setWorkoutLS(data);
        setWorkouts((workouts) => [...workouts, data]);
      }
    } else {
      const workoutID = Math.max(...workouts.map((w) => w.routineID)) + 1;
      let indexNumber = Math.max(...workouts.map((w) => w.indexNumber));
      indexNumber = ((indexNumber / 1024) | 0) * 1024 + 1024;
      const newWorkout = { ...workout, indexNumber, routineID, workoutID };
      setWorkoutLS(newWorkout);
      setWorkouts((workouts) => [...workouts, newWorkout]);
    }
  };

  const putWorkout = async (workout: WorkoutData) => {
    const { routineID, workoutID, ...body } = workout;
    if (isUserLoggedIn(userID)) {
      const { error } = await fetchWrapper(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts/${workoutID}`,
        {
          retries: 3,
          responseType: "none",
          method: "PUT",
          body: JSON.stringify(body),
        }
      );
      if (error !== null) {
        // TODO handle error
      } else {
        setWorkoutLS(workout);
        setWorkouts((workouts) => {
          const index = workouts.findIndex(
            ({ workoutID }) => workoutID === workout.workoutID
          );
          const start = workouts.slice(0, index);
          const end = workouts.slice(index + 1);
          return [...start, workout, ...end];
        });
      }
    } else {
      setWorkoutLS(workout);
      setWorkouts((workouts) => {
        const index = workouts.findIndex(
          ({ workoutID }) => workoutID === workout.workoutID
        );
        const start = workouts.slice(0, index);
        const end = workouts.slice(index + 1);
        return [...start, workout, ...end];
      });
    }
  };

  const deleteWorkout = async (workout: WorkoutData) => {
    const { routineID, workoutID } = workout;
    if (isUserLoggedIn(userID)) {
      const { error } = await fetchWrapper(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts/${workoutID}`,
        {
          retries: 3,
          responseType: "none",
          method: "DELETE",
        }
      );
      if (error !== null) {
        // TODO handle error
      } else {
        deleteWorkoutLS(workout);
        setWorkouts((workouts) => {
          return workouts.filter(
            ({ workoutID }) => workoutID !== workout.workoutID
          );
        });
      }
    }
  };
  return {
    workouts,
    putWorkout: debounce(putWorkout, 500),
    postWorkout,
    deleteWorkout,
  };
};

export const useRoutines = (userID: number) => {
  const [routines, setRoutines] = useState(getRoutinesLS());
  useEffect(() => {
    if (isUserLoggedIn(userID)) {
      fetchWrapper<RoutineData[]>(`${ORIGIN}/v1/users/${userID}/routines`, {
        retries: 3,
        responseType: "JSON",
        method: "GET",
      }).then(({ data, error }) => {
        if (error !== null) {
          // TODO handle error
        } else {
          setRoutines(data);
          setRoutinesLS(data);
        }
      });
    }
  }, [userID]);

  const postRoutine = async (
    routine: Prettify<Omit<RoutineData, "routineID" | "userID" | "indexNumber">>
  ) => {
    if (isUserLoggedIn(userID)) {
      const { data, error } = await fetchWrapper<RoutineData>(
        `${ORIGIN}/v1/users/${userID}/routines`,
        {
          retries: 3,
          responseType: "JSON",
          method: "POST",
          body: JSON.stringify(routine),
        }
      );
      if (error !== null) {
        // TODO handle error
      } else {
        setRoutineLS(data);
        setRoutines((routines) => [...routines, data]);
      }
    } else {
      const routineID = Math.max(...routines.map((r) => r.routineID)) + 1;
      let indexNumber = Math.max(...routines.map((r) => r.indexNumber));
      indexNumber = ((indexNumber / 1024) | 0) * 1024 + 1024;
      const newRoutine = { ...routine, indexNumber, routineID, userID };
      setRoutineLS(newRoutine);
      setRoutines((routines) => [...routines, newRoutine]);
    }
  };

  const putRoutine = async (routine: RoutineData) => {
    const { routineID, routineName } = routine;
    if (isUserLoggedIn(userID)) {
      const { error } = await fetchWrapper(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}`,
        {
          method: "PUT",
          body: JSON.stringify({ routineName }),
          retries: 3,
          responseType: "none",
        }
      );
      if (error !== null) {
        // TODO handle error
      } else {
        setRoutineLS(routine);
        setRoutines((routines) => {
          const index = routines.findIndex(
            ({ routineID }) => routineID === routine.routineID
          );
          const start = routines.slice(0, index);
          const end = routines.slice(index + 1);
          return [...start, routine, ...end];
        });
      }
    } else {
      setRoutineLS(routine);
      setRoutines((routines) => {
        const index = routines.findIndex(
          ({ routineID }) => routineID === routine.routineID
        );
        const start = routines.slice(0, index);
        const end = routines.slice(index + 1);
        return [...start, routine, ...end];
      });
    }
  };

  const deleteRoutine = async (routine: RoutineData) => {
    const { userID, routineID } = routine;
    if (isUserLoggedIn(userID)) {
      const { error } = await fetchWrapper(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}`,
        {
          method: "DELETE",
          retries: 3,
          responseType: "none",
        }
      );
      if (error !== null) {
        // TODO handle error
      } else {
        deleteRoutineLS(routine);
        setRoutines((routines) => {
          return routines.filter(
            ({ routineID }) => routineID !== routine.routineID
          );
        });
      }
    } else {
      deleteRoutineLS(routine);
      setRoutines((routines) => {
        return routines.filter(
          ({ routineID }) => routineID !== routine.routineID
        );
      });
    }
  };

  return {
    routines,
    putRoutine: debounce(putRoutine, 500),
    postRoutine,
    deleteRoutine,
  };
};

export const useUserState = () => {
  const token =
    localStorage.getItem("google-token") ?? localStorage.getItem("apple-token");
  let id, isLoggedIn;
  if (token == null) {
    id = OFFLINE_USER_ID;
    isLoggedIn = false;
  } else {
    try {
      const payload = parseToken(token)["payload"];
      const ID = +payload.sub;
      if (isNaN(ID)) {
        id = OFFLINE_USER_ID;
        isLoggedIn = false;
      } else {
        id = ID;
        isLoggedIn = true;
      }
    } catch {
      id = OFFLINE_USER_ID;
      isLoggedIn = false;
    }
  }
  const [userID, setUserID] = useState(id);
  return [{ userID, isLoggedIn }, setUserID] as const;
};
