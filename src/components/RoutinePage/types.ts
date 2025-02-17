import { Page } from "@/misc";

export type RoutinePageProps = {
  page: Page;
  userID: number;
  setPage: (newState?: "Workout" | "Routine") => void;
};
