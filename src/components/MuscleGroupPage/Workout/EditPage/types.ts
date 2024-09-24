import { WorkoutData } from "../../../../misc";

export type EditPageProps = {
  disable: () => void;
  update: (data: WorkoutData) => void;
} & Omit<WorkoutData, "workoutID">;
