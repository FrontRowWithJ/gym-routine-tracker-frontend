import { Page } from "@/misc";

export type RoutinePageProps = {
  page: Page;
  userID: number;
  setPageAndPageName: (pageName: string) => void;
};
