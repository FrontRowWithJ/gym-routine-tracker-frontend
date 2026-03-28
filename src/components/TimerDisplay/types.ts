import { Timestamp } from "@/components/Timer";

export type TimerDisplayProps = {
  stopTimer: () => void;
} & Timestamp;
