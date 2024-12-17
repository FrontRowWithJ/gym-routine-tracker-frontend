import { WorkoutData, WorkoutFetchFuncs } from "@/misc";

export type WorkoutProps = {
  enableVideo: () => void;
  workoutData: WorkoutData;
  PUT: WorkoutFetchFuncs["PUT"];
  POST: WorkoutFetchFuncs["POST"];
  DELETE: WorkoutFetchFuncs["DELETE"]
};
