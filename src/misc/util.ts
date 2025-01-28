import { RoutineIconProps } from "@/resources/SVG";
import {
  FormState,
  Theme,
  WorkoutDataCache,
  RoutineData,
  WorkoutData,
  RemoveOptional,
} from "./types";
import jsSHA from "jssha";
import { OFFLINE_USER_ID } from "./constants";

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

export const genDefaultFormState = <T>(resetValue: T): FormState<T> => {
  return Object.keys(resetValue).reduce<FormState<T>>((prev, key) => {
    prev[key] = { error: "", value: resetValue[key] };
    return prev;
  }, {} as FormState<T>);
};

//! Validators

export const validateNumber = (value: string, minimumValue: number): string => {
  if (!/^\d*$/.test(value)) return "Number is invalid.";
  return +value < minimumValue
    ? `Number must be greater than ${minimumValue - 1}.`
    : "";
};

export const validateName = (value: string): string =>
  value.length > 0 ? "" : "Name can't be empty.";

export const validateYoutubeLink = (value: string): string =>
  /^[\w-]{11}$|^$/.test(value) ? "" : "Please enter a valid video id.";

const orders = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0], //!
  [2, 0, 1], //!
  [2, 1, 0],
];

const byteToOrder = (byte: number) => {
  const n = ((byte / 256) * orders.length) | 0;
  return orders[n];
};

const shuffle = (bytes: Uint8Array, order: number[]) => {
  return [bytes[order[0]], bytes[order[1]], bytes[order[2]]];
};

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const vmax = Math.max(r, g, b);
  const vmin = Math.min(r, g, b);
  let h: number = 0;
  let s: number;
  let l = (vmax + vmin) / 2;

  if (vmax === vmin) return [0, 0, l]; // achromatic

  const d = vmax - vmin;
  s = l > 0.5 ? d / (2 - vmax - vmin) : d / (vmax + vmin);
  if (vmax === r) h = (g - b) / d + (g < b ? 6 : 0);
  if (vmax === g) h = (b - r) / d + 2;
  if (vmax === b) h = (r - g) / d + 4;
  h /= 6;

  return [(h * 360) | 0, Math.max(50, (s * 100) | 0), (l * 100) | 0];
};
// UPGRADE use a better image generator
const getColors = (color: Uint8Array, byte: number) => {
  const order = byteToOrder(byte);
  const shuffledColor = shuffle(color, order);
  const [r, g, b] = shuffledColor;
  const [h, s, l] = rgbToHsl(r, g, b);
  return {
    stopColor0: `hsl(${h}, ${s}%, ${l}%)`,
    stopColor1: `hsl(${(h + 90) % 360}, ${s}%, ${l}%)`,
    stopColor2: `hsl(${(h + 180) % 360}, ${s}%, ${l}%)`,
    fill: `hsl(${(h + 270) % 360}, ${s}%, ${l}%)`,
  };
};

// const shaObj = new jsSHA("SHA3-512", "TEXT");
export const genIconProps = (value: string): RoutineIconProps => {
  // shaObj.update(value)
  const shaObj = new jsSHA("SHA-224", "TEXT", {
    hmacKey: { value, format: "TEXT" },
  });

  const hash = shaObj.getHash("UINT8ARRAY");
  const hashString = shaObj.getHash("HEX");
  // const hash = genRandomUintArray(20);
  const byte0 = (hash[12] << 8) | hash[13];
  const angle = (((byte0 >>> 7) / 512) * 360) | 0;
  // return { stopColor0, stopColor1, stopColor2, fill, angle, hash: hashString };
  return {
    ...getColors(hash.subarray(0, 6), hash[14]),
    angle,
    hash: hashString,
  };
};

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
  } catch (err) {
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
