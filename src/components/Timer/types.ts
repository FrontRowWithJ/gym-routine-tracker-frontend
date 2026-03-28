export type TimerProps = {};

export interface Timestamp {
  hour: number;
  minute: number;
  second: number;
}

export type ReducerAction =
  | { type: keyof Timestamp; newTime: number }
  | { type: "all"; timestamp: Timestamp };
