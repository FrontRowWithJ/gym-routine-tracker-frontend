import { useState, useEffect, useCallback, useMemo } from "react";
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
import { isUserLoggedIn, parseJWT } from "./util";
import { GymRoutineJWT, RoutineData, WorkoutData } from "./types";
import { DEFAULT_ERROR_MESSAGE, OFFLINE_USER_ID, ORIGIN } from "./constants";
import { debounce, fetchWrapper } from "./fetchHandler";

const GET = <T>(
  URL: string,
  setLS: (data: T) => Promise<void>,
  setState: (value: React.SetStateAction<T>) => void,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) => {
  fetchWrapper<T>(URL, { method: "GET" }).then(({ data, error }) => {
    if (error === null) {
      setLS(data).then(() => setState(data));
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
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) => {
  const updateLocalAfterPut = (data: T) => {
    setStateLS(data).then(() => {
      setState((stateList) => {
        const index = stateList.findIndex((item) => cmp(item, data));
        const start = stateList.slice(0, index);
        const end = stateList.slice(index + 1);
        return [...start, data, ...end];
      });
    });
  };

  if (isUserLoggedIn(userID)) {
    fetchWrapper(URL, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { Accept: "application/x-empty" },
    }).then(({ error }) => {
      if (error === null) {
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
  setTrigger?: (obj: {}) => void
) => {
  const updateLocalAfterPost = (data: T) => {
    setStateLS(data).then(() => {
      setState((stateList) => [...stateList, data]);
      setTrigger?.({});
    });
  };
  if (isUserLoggedIn(userID)) {
    fetchWrapper<T>(URL, { method: "POST", body: JSON.stringify(body) }).then(
      ({ data, error }) => {
        if (error === null) {
          updateLocalAfterPost(data);
        } else {
          console.error(error);
          setErrorMessage(DEFAULT_ERROR_MESSAGE);
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
    updateLocalAfterPost(newData);
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
  setTrigger?: (obj: {}) => void
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
    fetchWrapper(URL, {
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
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
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
        setErrorMessage
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
      setTrigger
    );
  };

  const updateLocalAfterPut = (workout: WorkoutData) => {
    putWorkoutIDB(workout).then(() => {
      setWorkouts((workouts) => {
        const index = workouts.findIndex(
          ({ workoutID }) => workoutID === workout.workoutID
        );
        const start = workouts.slice(0, index);
        const end = workouts.slice(index + 1);
        return [...start, workout, ...end];
      });
    });
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
        setErrorMessage
      );
    },
    [userID, setErrorMessage]
  );

  const debouncePutWorkout = useMemo(
    () => debounce(putWorkout, 500, updateLocalAfterPut),
    [putWorkout]
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
      setTrigger
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

export const useRoutines = (
  userID: number,
  trigger: {},
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
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
        setErrorMessage
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
      setErrorMessage
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
      setErrorMessage
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
      setErrorMessage
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
  const jwt = localStorage.getItem("auth-token");
  let userID: number;
  if (jwt === null) {
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

export const useToggle = <const A, const B>(initalValue: A, other: B) => {
  const [state, setState] = useState<A | B>(initalValue);
  const toggle = (newState?: A | B) =>
    setState(newState ?? (state === initalValue ? other : initalValue));
  return [state, toggle] as const;
};
