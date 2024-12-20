import { useRoutines, useWorkouts } from "./hooks";

export type WorkoutData = {
  routineID: number;
  workoutID: number;
  workoutName: string;
  setCount: number;
  repCount: number;
  unit: Unit;
  increment: number;
  weight: number;
  youtubeID: string;
  indexNumber: number;
};

export type RoutineData = {
  userID: number;
  routineID: number;
  routineName: string;
  indexNumber: number;
  workoutCount: number;
};

export type Theme = "dark" | "light";
export type Page = "Workout" | "Routine";
export type Unit = "N/A" | "kg" | "s" | "mins";

export type FormState<T> = {
  [key in keyof T]: {
    value: T[key];
    error: string;
  };
};

export type StateToAction<T> =
  | { [K in keyof T]: { type: K; value: T[K] } }[keyof T]
  | { type: "reset"; value: FormState<T> };

export type WorkoutDataCache = {
  [routineID: string]: StrictOmit<RoutineData, "routineID"> & {
    workouts: WorkoutData[];
  };
};

export type Action = "create" | "update" | "delete";

export type JWTPayload = {
  iss: string;
  sub: string;
  aud: string[];
  exp: number;
  nbf: number;
  iat: number;
};

export type JWTHeader = {
  alg: "HS256";
  typ: "JWT";
};

export type Prettify<T> = { [K in keyof T]: T[K] } & {};
export type RemoveOptional<T, K extends keyof T> = Prettify<
  { [P in K]-?: T[P] } & T
>;
export type Exact<A, B> = A extends B ? (B extends A ? A : never) : never;

export type RoutineFetchFuncs = StrictOmit<
  ReturnType<typeof useRoutines>,
  "routines"
>;

export type WorkoutFetchFuncs = StrictOmit<
  ReturnType<typeof useWorkouts>,
  "workouts"
>;

export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

export type Replace<O, N extends { [key in keyof O]?: any }> = Prettify<{
  [key in keyof O]: key extends keyof N ? N[key] : O[key];
}>;

