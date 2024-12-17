import { RoutineData, StateToAction, RoutineFetchFuncs } from "@/misc";
import { DialogProps } from "@/components/FormDialog";

export type CreateOrEditRoutineDialogProps = {
  resetValue: RoutineData;
  PUT: RoutineFetchFuncs["PUT"];
  POST: RoutineFetchFuncs["POST"];
  DELETE: RoutineFetchFuncs["DELETE"];
} & Omit<DialogProps, "reset" | "save" | "deleteAction">;

export type Action = StateToAction<RoutineData>;
