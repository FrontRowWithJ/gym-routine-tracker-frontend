import { ToggleCountdownButtonProps } from "./types";
import { Button } from "@/components/Button";
import { PlayButton, Replay, Pause } from "@/resources/SVG";

export const ToggleCountdownButton = ({
  countdownState,
  onPause,
  onResume,
}: ToggleCountdownButtonProps) => {
  if (countdownState === "active") {
    return (
      <Button onClick={onPause}>
        <Pause />
      </Button>
    );
  }
  return (
    <Button onClick={onResume}>
      {countdownState === "inactive" ? <PlayButton /> : <Replay />}
    </Button>
  );
};
