import { RoutineData, RoutineFetchFuncs } from "@/misc";

export type RoutineProps = {
  setPage: () => void;
  routineData: RoutineData;
  PUT: RoutineFetchFuncs["PUT"];
  POST: RoutineFetchFuncs["POST"];
  DELETE: RoutineFetchFuncs["DELETE"];
};
