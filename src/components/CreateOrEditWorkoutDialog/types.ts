import { WorkoutData, StateToAction, WorkoutFetchFuncs } from "@/misc";
import { DialogProps } from "@/components/FormDialog";

export type CreateOrEditWorkoutDialogProps = {
  resetValue: WorkoutData;
  PUT: WorkoutFetchFuncs["PUT"];
  POST: WorkoutFetchFuncs["POST"];
  DELETE: WorkoutFetchFuncs["DELETE"];
} & Omit<DialogProps, "reset" | "save" | "deleteAction">;

type Workout = Omit<WorkoutData, "routineID" | "workoutID">;

export type Action = StateToAction<Workout>;
