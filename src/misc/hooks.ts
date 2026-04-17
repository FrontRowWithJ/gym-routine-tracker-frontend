import { useState, useEffect, useCallback, useRef } from "react";
import {
  getWorkoutsIDB,
  addWorkoutIDB,
  putWorkoutIDB,
  setWorkoutsIDB,
  deleteWorkoutIDB,
  getRoutinesIDB,
  setRoutineIDB,
  deleteRoutineIDB,
  setRoutinesIDB,
} from "./storage";
import { parseJWT } from "./util";
import { GymRoutineJWT, RoutineData, WorkoutData } from "./types";
import { DEFAULT_ERROR_MESSAGE, ORIGIN } from "./constants";
import { debounce, fetchWrapper } from "./fetchHandler";

export const OFFLINE_USER_ID = -1;

const isValidJWT = (jwt: string) => {
  const { sub, exp } = parseJWT<GymRoutineJWT>(jwt).payload;
  const now = Math.floor(Date.now() / 1000);
  return !isNaN(+sub) && !isNaN(+exp) && now < +exp ? +sub : OFFLINE_USER_ID;
};

export const isUserLoggedIn = (userID: number) => {
  const jwt = localStorage.getItem("Authorization");
  return (
    userID !== OFFLINE_USER_ID &&
    jwt !== null &&
    isValidJWT(jwt) !== OFFLINE_USER_ID
  );
};

export const useUserState = () => {
  const jwt = localStorage.getItem("Authorization");
  const id = jwt === null ? OFFLINE_USER_ID : isValidJWT(jwt);
  if (id === OFFLINE_USER_ID) localStorage.removeItem("Authorization");
  return useState(id);
};

const GET = <T>(
  URL: string,
  setLS: (data: T) => Promise<void>,
  setState: (value: React.SetStateAction<T>) => void,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
) => {
  fetchWrapper<"application/json", { Authorization: string; data: T }>(URL, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).then(({ response, error }) => {
    if (error === null) {
      const { Authorization, data } = response;
      setLS(data).then(() => {
        localStorage.setItem("Authorization", Authorization);
        setState(data);
      });
    } else {
      console.error(error);
      setErrorMessage(DEFAULT_ERROR_MESSAGE);
    }
  });
};

const PUT = <T>(
  URL: string,
  userID: number,
  cmp: (a: T, b: T) => boolean,
  data: T,
  body: { [K in keyof T]?: T[K] },
  setStateLS: (data: T) => Promise<void>,
  setState: (value: React.SetStateAction<T[]>) => void,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
) => {
  const updateLocalAfterPut = (data: T) => {
    setState((stateList) => {
      const index = stateList.findIndex((item) => cmp(item, data));
      const start = stateList.slice(0, index);
      const end = stateList.slice(index + 1);
      return [...start, data, ...end];
    });
    setStateLS(data);
  };

  if (isUserLoggedIn(userID)) {
    fetchWrapper<"application/json", { Authorization: string }>(URL, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { Accept: "application/json" },
    }).then(({ response, error }) => {
      if (error === null) {
        localStorage.setItem("Authorization", response.Authorization);
        updateLocalAfterPut(data);
      } else {
        console.error(error);
        setErrorMessage(DEFAULT_ERROR_MESSAGE);
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
  setStateLS: (data: T) => Promise<void>,
  setState: (value: React.SetStateAction<T[]>) => void,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setTrigger?: (obj: {}) => void,
) => {
  const updateLocalAfterPost = (response: {
    Authorization?: string;
    data: T;
  }) => {
    const { data, Authorization } = response;
    setStateLS(data).then(() => {
      if (Authorization) localStorage.setItem("Authorization", Authorization);
      setState((stateList) => [...stateList, data]);
      setTrigger?.({});
    });
  };
  if (isUserLoggedIn(userID)) {
    fetchWrapper<"application/json", { Authorization: string; data: T }>(URL, {
      method: "POST",
      body: JSON.stringify(body),
    }).then(({ response, error }) => {
      if (error === null) {
        updateLocalAfterPost(response);
      } else {
        console.error(error);
        setErrorMessage(DEFAULT_ERROR_MESSAGE);
      }
    });
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
    updateLocalAfterPost({ data: newData });
  }
};

const DELETE = <T>(
  URL: string,
  userID: number,
  cmp: (a: T, b: T) => boolean,
  data: T,
  deleteLS: (data: T) => Promise<void>,
  setState: (value: React.SetStateAction<T[]>) => void,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setTrigger?: (obj: {}) => void,
) => {
  const updateAfterDelete = (obj: T) => {
    deleteLS(obj).then(() => {
      setState((stateList) => {
        return stateList.filter((item) => cmp(item, obj));
      });
      setTrigger?.({});
    });
  };
  if (isUserLoggedIn(userID)) {
    fetchWrapper<"application/x-empty">(URL, {
      method: "DELETE",
      headers: { Accept: "application/x-empty" },
    }).then(({ error }) => {
      if (error === null) {
        updateAfterDelete(data);
      } else {
        console.error(error);
        setErrorMessage(DEFAULT_ERROR_MESSAGE);
      }
    });
  } else {
    updateAfterDelete(data);
  }
};

export const useWorkouts = (
  userID: number,
  routineID: number,
  setTrigger: React.Dispatch<React.SetStateAction<{}>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
) => {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  useEffect(() => {
    getWorkoutsIDB(routineID).then((workouts) => setWorkouts(workouts));
  }, [routineID]);
  useEffect(() => {
    if (isUserLoggedIn(userID)) {
      GET(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts`,
        setWorkoutsIDB,
        setWorkouts,
        setErrorMessage,
      );
    }
  }, [userID, routineID, setErrorMessage]);

  const postWorkout = (workout: WorkoutData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { workoutID, routineID, indexNumber, ...body } = workout;
    POST(
      `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts`,
      userID,
      "workoutID",
      body,
      workout,
      workouts,
      addWorkoutIDB,
      setWorkouts,
      setErrorMessage,
      setTrigger,
    );
  };

  const updateLocalAfterPut = (workout: WorkoutData) => {
    setWorkouts((workouts) => {
      const index = workouts.findIndex(
        ({ workoutID }) => workoutID === workout.workoutID,
      );
      const start = workouts.slice(0, index);
      const end = workouts.slice(index + 1);
      return [...start, workout, ...end];
    });
    putWorkoutIDB(workout);
  };

  const putWorkout = useCallback(
    (workout: WorkoutData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { routineID, workoutID, indexNumber, ...body } = workout;
      PUT(
        `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts/${workoutID}`,
        userID,
        (a, b) => a.workoutID === b.workoutID,
        workout,
        body,
        putWorkoutIDB,
        setWorkouts,
        setErrorMessage,
      );
    },
    [userID, setErrorMessage],
  );

  const debouncePutWorkout = useRef(
    debounce(putWorkout, 500, updateLocalAfterPut),
  );

  const deleteWorkout = async (workout: WorkoutData) => {
    const { workoutID } = workout;
    DELETE(
      `${ORIGIN}/v1/users/${userID}/routines/${routineID}/workouts/${workoutID}`,
      userID,
      (a, b) => a.workoutID !== b.workoutID,
      workout,
      deleteWorkoutIDB,
      setWorkouts,
      setErrorMessage,
      setTrigger,
    );
  };
  return {
    workouts,
    putWorkout,
    postWorkout,
    deleteWorkout,
    debouncePutWorkout: debouncePutWorkout.current,
  };
};

export const useRoutines = (
  userID: number,
  trigger: {},
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
) => {
  const [routines, setRoutines] = useState<RoutineData[]>([]);
  useEffect(() => {
    getRoutinesIDB(userID).then((routines) => setRoutines(routines));
  }, [userID]);
  useEffect(() => {
    if (isUserLoggedIn(userID)) {
      GET(
        `${ORIGIN}/v1/users/${userID}/routines`,
        setRoutinesIDB,
        setRoutines,
        setErrorMessage,
      );
    }
  }, [userID, trigger, setErrorMessage]);

  const postRoutine = (routine: RoutineData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { routineID, userID, indexNumber, workoutCount, ...body } = routine;
    POST(
      `${ORIGIN}/v1/users/${userID}/routines`,
      userID,
      "routineID",
      body,
      routine,
      routines,
      setRoutineIDB,
      setRoutines,
      setErrorMessage,
    );
  };

  const putRoutine = (routine: RoutineData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userID, routineID, indexNumber, workoutCount, ...body } = routine;
    PUT(
      `${ORIGIN}/v1/users/${userID}/routines/${routineID}`,
      userID,
      (a, b) => a.routineID === b.routineID,
      routine,
      body,
      setRoutineIDB,
      setRoutines,
      setErrorMessage,
    );
  };

  const deleteRoutine = (routine: RoutineData) => {
    const { routineID } = routine;
    DELETE(
      `${ORIGIN}/v1/users/${userID}/routines/${routineID}`,
      userID,
      (a, b) => a.routineID !== b.routineID,
      routine,
      deleteRoutineIDB,
      setRoutines,
      setErrorMessage,
    );
  };
  return {
    routines,
    putRoutine,
    postRoutine,
    deleteRoutine,
  };
};

export const useToggle = <const A, const B>(initialValue: A, other: B) => {
  const [state, setState] = useState<A | B>(initialValue);
  const toggle = useCallback(
    (newState?: A | B) =>
      setState(
        (prev) => newState ?? (prev === initialValue ? other : initialValue),
      ),
    [initialValue, other],
  );
  return [state, toggle] as const;
};

export const useWindowEvent = <K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  deps?: React.DependencyList,
) => {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      type,
      function (ev) {
        listenerRef.current.call(this, ev);
      },
      { signal: controller.signal },
    );
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ...(deps ?? [])]);
};
