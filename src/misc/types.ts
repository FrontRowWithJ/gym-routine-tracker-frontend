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
  [routineID: string]: Omit<RoutineData, "routineID"> & {
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

export type RoutineFetchFuncs = {
  PUT: ReturnType<typeof useRoutines>["putRoutine"];
  POST: ReturnType<typeof useRoutines>["postRoutine"];
  DELETE: ReturnType<typeof useRoutines>["deleteRoutine"];
};

export type WorkoutFetchFuncs = {
  PUT: ReturnType<typeof useWorkouts>["putWorkout"];
  POST: ReturnType<typeof useWorkouts>["postWorkout"];
  DELETE: ReturnType<typeof useWorkouts>["deleteWorkout"];
};
