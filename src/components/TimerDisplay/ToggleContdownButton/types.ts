import { CountdownState } from "../types";

export type ToggleCountdownButtonProps = {
  countdownState: CountdownState;
  onPause: React.MouseEventHandler<HTMLButtonElement>;
  onResume: React.MouseEventHandler<HTMLButtonElement>;
};
