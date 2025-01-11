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
  parseJWT,
  getJWT,
} from "./util";
import { GymRoutineJWT, RoutineData, Theme, WorkoutData } from "./types";
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

const GET = <T>(
  URL: string,
  setLS: (data: T) => void,
  setState: (value: React.SetStateAction<T>) => void
) => {
  fetchWrapper<T>(URL, { method: "GET" }).then(({ data, error }) => {
    if (error === null) {
      setLS(data);
      setState(data);
    } else {
      console.error(error);
      //TODO handle error [failed GET request]
    }
  });
};

const PUT = <T, S extends keyof T>(
  URL: string,
  userID: number,
  idKey: S extends `${string}ID` ? S : never,
  data: T,
  body: { [K in keyof T]?: T[K] },
  setStateLS: (data: T) => void,
  setState: (value: React.SetStateAction<T[]>) => void
) => {
  const updateLocalAfterPut = (data: T) => {
    setStateLS(data);
    setState((stateList) => {
      const index = stateList.findIndex((item) => item[idKey] === data[idKey]);
      const start = stateList.slice(0, index);
      const end = stateList.slice(index + 1);
      return [...start, data, ...end];
    });
  };

  if (isUserLoggedIn(userID)) {
    fetchWrapper(URL, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { Accept: "application/x-empty" },
    }).then(({ error }) => {
      if (error !== null) {
        updateLocalAfterPut(data);
      } else {
        console.error(error);
        // TODO handle error [failed PUT request]
      }
    });
  } else {
    updateLocalAfterPut(data);
  }
};

const POST = <T extends { indexNumber: number }, S extends keyof T>(
  URL: string,
  userID: number,
  idKey: S extends `${string}ID` ? S : never,
  body: { [K in keyof T]?: T[K] },
  data: T,
  records: T[],
  setStateLS: (data: T) => void,
  setState: (value: React.SetStateAction<T[]>) => void,
  trigger?: (obj: {}) => void
) => {
  if (isUserLoggedIn(userID)) {
    fetchWrapper<T>(URL, { method: "POST", body: JSON.stringify(body) }).then(
      ({ data, error }) => {
        if (error === null) {
          setStateLS(data);
          setState((stateList) => [...stateList, data]);
          trigger?.({});
        } else {
          console.error(error);
          // TODO handle error [failed POST request]
        }
      }
    );
  } else {
    const id =
      records.length === 0
        ? 0
        : Math.max(...(records.map((d) => d[idKey]) as number[])) + 1;
    let indexNumber =
      records.length === 0
        ? 1024
        : Math.max(...records.map((d) => d.indexNumber));
    indexNumber = ((indexNumber / 1024) | 0) * 1024 + 1024;
    const newData = { ...data, indexNumber, [idKey]: id };
    setStateLS(newData);
    setState((stateList) => [...stateList, newData]);
    trigger?.({});
  }
};

const DELETE = <T, S extends keyof T>(
  URL: string,
  userID: number,
  idKey: S extends `${string}ID` ? S : never,
  data: T,
  deleteLS: (data: T) => void,
  setState: (value: React.SetStateAction<T[]>) => void
) => {
  const updateAfterDelete = (obj: T) => {
    deleteLS(obj);
    setState((stateList) => {
      return stateList.filter((item) => item[idKey] !== obj[idKey]);
    });
  };
  if (isUserLoggedIn(userID)) {
    fetchWrapper(URL, {
      method: "DELETE",
      headers: { Accept: "application/x-empty" },
    }).then(({ error }) => {
      if (error === null) {
        updateAfterDelete(data);
      } else {
        console.error(error);
        // TODO handle error [failed DELETE request]
      }
    });
  } else {
    updateAfterDelete(data);
  }
};

export const useWorkouts = (
  userID: number,
  routineID: number,
  setTrigger: React.Dispatch<React.SetStateAction<{}>>
) => {
  const [workouts, setWorkouts] = useState(getWorkoutsLS(routineID));
  useEffect(() => {
    if (isUserLoggedIn(userID)) {
      GET(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts`,
        setWorkoutsLS,
        setWorkouts
      );
    }
  }, [userID, routineID]);

  const postWorkout = (workout: WorkoutData) => {
    const { workoutID, routineID, indexNumber, ...body } = workout;
    POST(
      `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts`,
      userID,
      "workoutID",
      body,
      workout,
      workouts,
      setWorkoutLS,
      setWorkouts,
      setTrigger
    );
  };

  const updateLocalAfterPut = (workout: WorkoutData) => {
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

  const putWorkout = (workout: WorkoutData) => {
    const { routineID, workoutID, indexNumber, ...body } = workout;
    PUT(
      `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts/${workoutID}`,
      userID,
      "workoutID",
      workout,
      body,
      setWorkoutLS,
      setWorkouts
    );
  };
  const debouncePutWorkout = useCallback(
    debounce(putWorkout, 500, updateLocalAfterPut),
    []
  );

  const deleteWorkout = async (workout: WorkoutData) => {
    const { workoutID } = workout;
    DELETE(
      `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts/${workoutID}`,
      userID,
      "workoutID",
      workout,
      deleteWorkoutLS,
      setWorkouts
    );
  };
  return {
    workouts,
    putWorkout,
    postWorkout,
    deleteWorkout,
    debouncePutWorkout,
  };
};

export const useRoutines = (userID: number, trigger: {}) => {
  const [routines, setRoutines] = useState(getRoutinesLS());
  useEffect(() => {
    if (isUserLoggedIn(userID)) {
      GET(`${ORIGIN}/v1/users/${userID}/routines`, setRoutinesLS, setRoutines);
    }
  }, [userID, trigger]);

  const postRoutine = (routine: RoutineData) => {
    const { routineID, userID, indexNumber, workoutCount, ...body } = routine;
    POST(
      `${ORIGIN}/v1/users/${userID}/routines`,
      userID,
      "routineID",
      body,
      routine,
      routines,
      setRoutineLS,
      setRoutines
    );
  };

  const putRoutine = (routine: RoutineData) => {
    const { userID, routineID, indexNumber, workoutCount, ...body } = routine;
    PUT(
      `${ORIGIN}/v1/users/${userID}/routines/${routineID}`,
      userID,
      "routineID",
      routine,
      body,
      setRoutineLS,
      setRoutines
    );
  };

  const deleteRoutine = (routine: RoutineData) => {
    const { routineID } = routine;
    DELETE(
      `${ORIGIN}/v1/users/${userID}/routines/${routineID}`,
      userID,
      "routineID",
      routine,
      deleteRoutineLS,
      setRoutines
    );
  };

  return {
    routines,
    putRoutine,
    postRoutine,
    deleteRoutine,
  };
};

export const useUserState = () => {
  const jwt = getJWT();
  let userID: number;
  if (jwt == null) {
    userID = OFFLINE_USER_ID;
  } else {
    try {
      const payload = parseJWT<GymRoutineJWT>(jwt)["payload"];
      const ID = +payload.sub;
      const exp = +payload.exp;
      const now = window.performance.now();
      if (isNaN(ID) || isNaN(exp) || now >= exp) {
        userID = OFFLINE_USER_ID;
        localStorage.clear();
      } else {
        userID = ID;
      }
    } catch {
      userID = OFFLINE_USER_ID;
    }
  }
  return useState(userID);
};
