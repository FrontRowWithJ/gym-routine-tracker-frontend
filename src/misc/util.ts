import {
  Theme,
  WorkoutDataCache,
  RoutineData,
  WorkoutData,
  RemoveOptional,
} from "./types";
import { OFFLINE_USER_ID } from "./constants";
import jsSHA from "jssha";

export const getTheme: () => Theme = () => {
  const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  return localStorage.getItem("theme") ?? theme;
};

export const getYoutubeThumbnail = (youtubeID: string) => {
  if (youtubeID === "") return "" as const;
  return `https://i3.ytimg.com/vi/${youtubeID}/mqdefault.jpg` as const;
};

//! Validators

export const validateName = (value: string): string =>
  value.length > 0 ? "" : "Name can't be empty.";

// UPGRADE swap out localstorage for indexedDB
export const getCache = () => {
  const cache = localStorage.getItem("cache");
  if (cache === null) {
    localStorage.setItem("cache", "{}");
    return {};
  }
  return JSON.parse(cache) as WorkoutDataCache;
};

export const getRoutinesLS = () => {
  const cache = getCache();
  const routines: RoutineData[] = Object.keys(cache).map((routineID) => {
    const { workouts, ...rest } = cache[routineID];
    return { ...rest, routineID: +routineID };
  });
  routines.sort((a, b) => a.indexNumber - b.indexNumber);
  return routines;
};

export const setRoutineLS = ({ routineID, ...rest }: RoutineData) => {
  const cache = getCache();
  if (routineID in cache) {
    cache[routineID] = { ...cache[routineID], ...rest };
  } else {
    cache[routineID] = { ...rest, workouts: [] };
  }
  localStorage.setItem("cache", JSON.stringify(cache));
};

export const setRoutinesLS = (routines: RoutineData[]) => {
  const cache = getCache();
  const newCache: WorkoutDataCache = {};
  for (const routine of routines) {
    const { routineID } = routine;
    const workouts = cache?.[routineID]?.workouts ?? [];
    newCache[routineID] = { ...routine, workouts };
  }
  localStorage.setItem("cache", JSON.stringify(newCache));
};

export const deleteRoutineLS = (routineData: RoutineData) => {
  const cache = getCache();
  const { [routineData.routineID]: toBeDeleted, ...rest } = cache;
  localStorage.setItem("cache", JSON.stringify(rest));
};

export const getWorkoutsLS = (routineID: number): WorkoutData[] => {
  const cache = getCache();
  const workouts = cache[routineID].workouts;
  workouts.sort((a, b) => a.indexNumber - b.indexNumber);
  return workouts;
};

export const setWorkoutLS = (workoutData: WorkoutData) => {
  const cache = getCache();
  const { workouts } = cache[workoutData.routineID];
  const index = workouts.findIndex(
    (workout) => workout.workoutID === workoutData.workoutID
  );
  if (index === -1) {
    cache[workoutData.routineID].workoutCount++;
    workouts.push(workoutData);
  } else workouts[index] = workoutData;
  localStorage.setItem("cache", JSON.stringify(cache));
};

export const setWorkoutsLS = (workouts: WorkoutData[]) => {
  if (workouts.length === 0) return;
  for (let i = 0; i < workouts.length; i++)
    if (workouts[i].routineID !== workouts[0].routineID)
      throw new Error("Routines in the array must all be the same");
  const cache = getCache();
  cache[workouts[0].routineID].workouts = workouts;
  localStorage.setItem("cache", JSON.stringify(cache));
};

export const deleteWorkoutLS = (workoutData: WorkoutData) => {
  const cache = getCache();
  const { workouts } = cache[workoutData.routineID];
  cache[workoutData.routineID].workoutCount--;
  cache[workoutData.routineID].workouts = workouts.filter(
    (workout) => workout.workoutID !== workoutData.workoutID
  );
  localStorage.setItem("cache", JSON.stringify(cache));
};

export const generateRandomString = (numOfBytes: number) => {
  const randomValues = crypto.getRandomValues(new Uint8Array(numOfBytes));
  // Encode as UTF-8
  const utf8Encoder = new TextEncoder();
  const utf8Array = utf8Encoder.encode(
    String.fromCharCode.apply(null, randomValues as any)
  );
  // Base64 encode the UTF-8 data
  return btoa(String.fromCharCode.apply(null, utf8Array as any))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

// if the user is offline then the ID number should be -1
export const isUserLoggedIn = (userID: number) => userID !== OFFLINE_USER_ID;

export const parseJWT = <
  const JWT extends {
    header: Record<string, any>;
    payload: Record<string, any>;
    signature: string;
  }
>(
  token: string
): JWT => {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");
  const [header, payload, signature] = parts;
  try {
    return {
      header: JSON.parse(window.atob(header)),
      payload: JSON.parse(window.atob(payload)),
      signature,
    } as JWT;
  } catch {
    throw new Error("Invalid token");
  }
};

export const applyDefaultRequestInitParams = (
  requestInit: RemoveOptional<RequestInit, "method">
): RequestInit => {
  const token = localStorage.getItem("auth-token");
  const { headers, ...rest } = requestInit;
  return {
    credentials: "include",
    mode: "cors",
    integrity: "",
    keepalive: false,
    cache: "default",
    referrer: window.location.href,
    referrerPolicy: "no-referrer-when-downgrade",
    window: null,
    redirect: "error",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token !== null && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...rest,
  };
};

export const logout = () => {
  localStorage.removeItem("auth-token");
  localStorage.removeItem("cache");
  window.location.href = window.location.origin;
};

export const animateBackground = (
  direction: "forwards" | "reverse" = "forwards"
) => {
  const controller = new AbortController();
  const main = document.getElementsByClassName(
    "main-page"
  )![0] as HTMLDivElement;
  const classNames = ["domain-expansion", `animate-${direction}`];
  main.addEventListener(
    "animationend",
    () => {
      main.classList.remove(...classNames);
      controller.abort();
    },
    { signal: controller.signal }
  );
  main.classList.add(...classNames);
};

export const hashString = (value: string) => {
  return new jsSHA("SHA-256", "TEXT", {
    hmacKey: { value, format: "TEXT", encoding: "UTF8" },
  }).getHash("UINT8ARRAY", { outputLen: 16 });
};
