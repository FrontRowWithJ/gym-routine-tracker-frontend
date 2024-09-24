export type WorkoutData = {
  workoutID: number;
  routineID: number;
  workoutName: string;
  setCount: number;
  repCount: number;
  unit: "" | "mins" | "kg" | "s";
  unitAmount: number;
  amount: number;
  tutorialLink: "" | `https://www.youtube.com/embed/${string}`;
};
