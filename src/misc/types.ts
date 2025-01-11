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

type JWT<H, P> = {
  header: H;
  payload: P;
  signature: string;
};

type GoogleAuthJWTHeader = {
  alg: "RS256";
  kid: string;
  typ: "JWT";
};

type GoogleAuthJWTPayload = {
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  nbf: number;
  nonce: string;
  picture: string;
  sub: string;
};
export type GoogleAuthJWT = JWT<GoogleAuthJWTHeader, GoogleAuthJWTPayload>;

type GymRoutineJWTHeader = {
  alg: "HS256";
  typ: "JWT";
};

type GymRoutineJWTPayload = {
  iss: string;
  sub: string;
  aud: string[];
  exp: number;
  nbf: number;
  iat: number;
  preferred_username: string;
};

export type GymRoutineJWT = JWT<GymRoutineJWTHeader, GymRoutineJWTPayload>;
