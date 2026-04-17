import { RoutineData, RoutineFetchFuncs } from "@/misc";

export type RoutineProps = {
  setPage: VoidFunction;
  routineData: RoutineData;
  PUT: RoutineFetchFuncs["putRoutine"];
  POST: RoutineFetchFuncs["postRoutine"];
  DELETE: RoutineFetchFuncs["deleteRoutine"];
};
