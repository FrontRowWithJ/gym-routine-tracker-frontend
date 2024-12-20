import {
  WorkoutData,
  StateToAction,
  WorkoutFetchFuncs,
  StrictOmit,
} from "@/misc";
import { DialogProps } from "@/components/FormDialog";

export type CreateOrEditWorkoutDialogProps = {
  resetValue: WorkoutData;
  PUT: WorkoutFetchFuncs["putWorkout"];
  POST: WorkoutFetchFuncs["postWorkout"];
  DELETE: WorkoutFetchFuncs["deleteWorkout"];
} & StrictOmit<DialogProps, "reset" | "save" | "deleteAction">;

export type Action = StateToAction<
  StrictOmit<WorkoutData, "routineID" | "workoutID">
>;
