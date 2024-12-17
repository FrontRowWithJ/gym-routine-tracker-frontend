import { Page } from "@/misc";

export type WorkoutPageProps = {
  userID: number;
  routineID: number;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
};
