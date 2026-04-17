import { ReducerAction, Timestamp } from "../Timer";
export type SavedTimestampsProps = {
  setTime: React.ActionDispatch<[action: ReducerAction]>;
  time: Timestamp;
};
