import { useState, useEffect, useCallback } from "react";
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
  Prettify,
  RoutineData,
  StrictOmit,
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

export const useWorkouts = (
  userID: number,
  routineID: number,
  setTrigger: React.Dispatch<React.SetStateAction<{}>>
) => {
  const [workouts, setWorkouts] = useState(getWorkoutsLS(routineID));
  useEffect(() => {
    if (isUserLoggedIn(userID)) {
      fetchWrapper<WorkoutData[]>(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts`,
        {
          retries: 3,
          method: "GET",
          headers: {
            Accept: "application/json",
          },
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

  const postWorkout = <T>(
    workout: Exact<
      T,
      Prettify<
        StrictOmit<WorkoutData, "workoutID" | "routineID" | "indexNumber">
      >
    >
  ) => {
    if (isUserLoggedIn(userID)) {
      fetchWrapper<WorkoutData>(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts`,
        {
          retries: 3,
          method: "POST",
          body: JSON.stringify(workout),
          headers: {
            Accept: "application/json",
          },
        }
      ).then(({ data, error }) => {
        if (error === null) {
          setWorkoutLS(data);
          setWorkouts((workouts) => [...workouts, data]);
          setTrigger({});
        } else {
          // TODO handle error
        }
      });
    } else {
      const workoutID = Math.max(...workouts.map((w) => w.routineID)) + 1;
      let indexNumber = Math.max(...workouts.map((w) => w.indexNumber));
      indexNumber = ((indexNumber / 1024) | 0) * 1024 + 1024;
      const newWorkout = { ...workout, indexNumber, routineID, workoutID };
      setWorkoutLS(newWorkout);
      setWorkouts((workouts) => [...workouts, newWorkout]);
      setTrigger({});
    }
  };

  const updateLocalAfterPut = <T>(workout: Exact<T, WorkoutData>) => {
    setWorkoutLS(workout);
    setWorkouts((workouts) => {
      const index = workouts.findIndex(
        ({ workoutID }) => workoutID === workout.workoutID
      );
      const start = workouts.slice(0, index);
      const end = workouts.slice(index + 1);
      return [...start, workout, ...end];
    });
  };

  const putWorkout = <T>(workout: Exact<T, WorkoutData>) => {
    const { routineID, workoutID, indexNumber, ...body } = workout;
    if (isUserLoggedIn(userID)) {
      fetchWrapper(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts/${workoutID}`,
        {
          retries: 3,
          method: "PUT",
          body: JSON.stringify(body),
          headers: {
            Accept: "application/x-empty",
          },
        }
      ).then(({ error }) => {
        if (error !== null) updateLocalAfterPut(workout);
        else {
          // TODO handle error
        }
      });
    } else {
      updateLocalAfterPut(workout);
    }
  };

  const updateLocalAfterDelete = <T>(workout: Exact<T, WorkoutData>) => {
    deleteWorkoutLS(workout);
    setWorkouts((workouts) => {
      return workouts.filter(
        ({ workoutID }) => workoutID !== workout.workoutID
      );
    });
  };

  const deleteWorkout = async <T>(workout: Exact<T, WorkoutData>) => {
    const { routineID, workoutID } = workout;
    if (isUserLoggedIn(userID)) {
      fetchWrapper(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts/${workoutID}`,
        {
          retries: 3,
          headers: {
            Accept: "application/x-empty",
          },
          method: "DELETE",
        }
      ).then(({ error }) => {
        if (error === null) {
          updateLocalAfterDelete(workout);
        } else {
          // TODO handle error
        }
      });
    } else {
      updateLocalAfterDelete(workout);
    }
  };
  return {
    workouts,
    putWorkout,
    postWorkout,
    deleteWorkout,
    debouncePutWorkout: useCallback(
      debounce(putWorkout, 500, updateLocalAfterPut),
      [userID]
    ),
  };
};

export const useRoutines = (userID: number, trigger: {}) => {
  const [routines, setRoutines] = useState(getRoutinesLS());
  useEffect(() => {
    if (isUserLoggedIn(userID)) {
      fetchWrapper<RoutineData[]>(`${ORIGIN}/v1/users/${userID}/routines`, {
        retries: 3,
        headers: {
          Accept: "application/json",
        },
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
  }, [userID, trigger]);

  const postRoutine = <T>(
    routine: Exact<
      T,
      Prettify<
        StrictOmit<
          RoutineData,
          "routineID" | "userID" | "indexNumber" | "workoutCount"
        >
      >
    >
  ) => {
    if (isUserLoggedIn(userID)) {
      fetchWrapper<RoutineData>(`${ORIGIN}/v1/users/${userID}/routines`, {
        retries: 3,
        headers: {
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify(routine),
      }).then(({ data, error }) => {
        if (error === null) {
          setRoutineLS(data);
          setRoutines((routines) => [...routines, data]);
        } else {
          // TODO handle error
        }
      });
    } else {
      const routineID = Math.max(...routines.map((r) => r.routineID)) + 1;
      let indexNumber = Math.max(...routines.map((r) => r.indexNumber));
      indexNumber = ((indexNumber / 1024) | 0) * 1024 + 1024;
      const newRoutine = {
        ...routine,
        indexNumber,
        routineID,
        userID,
        workoutCount: 0,
      };
      setRoutineLS(newRoutine);
      setRoutines((routines) => [...routines, newRoutine]);
    }
  };

  const updateLocalAfterPut = <T>(routine: Exact<T, RoutineData>) => {
    setRoutineLS(routine);
    setRoutines((routines) => {
      const index = routines.findIndex(
        ({ routineID }) => routineID === routine.routineID
      );
      const start = routines.slice(0, index);
      const end = routines.slice(index + 1);
      return [...start, routine, ...end];
    });
  };

  const putRoutine = <T>(routine: Exact<T, RoutineData>) => {
    const { routineID, routineName } = routine;
    if (isUserLoggedIn(userID)) {
      fetchWrapper(`${ORIGIN}/v1/users/${userID}/routines/${routineID}`, {
        method: "PUT",
        body: JSON.stringify({ routineName }),
        retries: 3,
        headers: {
          Accept: "application/x-empty",
        },
      }).then(({ error }) => {
        if (error === null) updateLocalAfterPut(routine);
        else {
          // TODO handle error
        }
      });
    } else {
      updateLocalAfterPut(routine);
    }
  };

  const updateLocalAfterDelete = <T>(routine: Exact<T, RoutineData>) => {
    deleteRoutineLS(routine);
    setRoutines((routines) => {
      return routines.filter(
        ({ routineID }) => routineID !== routine.routineID
      );
    });
  };

  const deleteRoutine = <T>(routine: Exact<T, RoutineData>) => {
    const { userID, routineID } = routine;
    if (isUserLoggedIn(userID)) {
      fetchWrapper(`${ORIGIN}/v1/users/${userID}/routines/${routineID}`, {
        method: "DELETE",
        retries: 3,
        headers: { Accept: "application/x-empty" },
      }).then(({ error }) => {
        if (error === null) {
          updateLocalAfterDelete(routine);
        } else {
          // TODO handle error
        }
      });
    } else {
      updateLocalAfterDelete(routine);
    }
  };

  return {
    routines,
    putRoutine,
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
