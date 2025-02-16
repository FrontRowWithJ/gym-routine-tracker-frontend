export type WorkoutPageProps = {
  userID: number;
  routineID: number;
  setPage: (newState?: "Workout" | "Routine") => void;
  setTrigger: React.Dispatch<React.SetStateAction<{}>>;
};
