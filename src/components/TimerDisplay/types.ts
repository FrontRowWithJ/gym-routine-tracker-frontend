import { Timestamp } from "@/components/Timer";

export type TimerDisplayProps = {
  stopTimer: VoidFunction;
} & Timestamp;

export type CountdownState = "active" | "inactive" | "finished";
