import { ReducerAction, Timestamp } from "@/components/Timer";

export type SlideProps = {
  time: number;
  maxTime: number;
  type: keyof Timestamp;
  setTime: React.ActionDispatch<[action: ReducerAction]>;
  UIUpdateTrigger: {};
  isSelected: boolean;
};
