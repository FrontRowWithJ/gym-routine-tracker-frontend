import { WorkoutData } from "../../../misc";

export type WorkoutProps = {
  increment: () => void;
  decrement: () => void;
  remove: () => void;
  update: (data: WorkoutData) => void;
} & WorkoutData;
