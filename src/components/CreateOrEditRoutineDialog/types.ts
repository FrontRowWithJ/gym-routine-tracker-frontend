import {
  RoutineData,
  StateToAction,
  RoutineFetchFuncs,
  StrictOmit,
} from "@/misc";
import { DialogProps } from "@/components/FormDialog";

export type CreateOrEditRoutineDialogProps = {
  resetValue: RoutineData;
  PUT: RoutineFetchFuncs["putRoutine"];
  POST: RoutineFetchFuncs["postRoutine"];
  DELETE: RoutineFetchFuncs["deleteRoutine"];
} & StrictOmit<DialogProps, "reset" | "save" | "deleteAction">;

export type Action = StateToAction<
  StrictOmit<RoutineData, "userID" | "routineID">
>;
