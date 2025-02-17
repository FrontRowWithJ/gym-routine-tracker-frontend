import { WorkoutData, WorkoutFetchFuncs } from "@/misc";

export type WorkoutProps = {
  workoutData: WorkoutData;
  PUT: WorkoutFetchFuncs["putWorkout"];
  POST: WorkoutFetchFuncs["postWorkout"];
  DELETE: WorkoutFetchFuncs["deleteWorkout"];
  debouncePUT: WorkoutFetchFuncs["debouncePutWorkout"];
};
