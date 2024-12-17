import { Page } from "@/misc";

export type RoutinePageProps = {
  page: Page;
  userID: number;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
};
