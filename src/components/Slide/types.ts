import { ReducerAction, Timestamp } from "@/components/Timer";

export type SlideProps = {
  time: number;
  maxTime: number;
  className: keyof Timestamp;
  setTime: React.ActionDispatch<[action: ReducerAction]>;
  UIUpdateTrigger: {};
  startAnimationRef: React.RefObject<((delta: number) => void) | undefined>;
};
