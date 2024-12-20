import { RoutineData, RoutineFetchFuncs } from "@/misc";

export type RoutineProps = {
  setPage: () => void;
  routineData: RoutineData;
  PUT: RoutineFetchFuncs["putRoutine"];
  POST: RoutineFetchFuncs["postRoutine"];
  DELETE: RoutineFetchFuncs["deleteRoutine"];
};
