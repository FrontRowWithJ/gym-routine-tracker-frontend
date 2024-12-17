import { ChartOrWorkoutButtonProps } from "./types";
import "./ChartOrWorkoutButton.css";
import { Button } from "@/components/Button";
import { Chart, Workout } from "@/resources/SVG";

export const ChartOrWorkoutButton = (props: ChartOrWorkoutButtonProps) => {
  return (
    <Button
      className="toggle-chart-or-workout-button"
      onClick={props.toggleMode}
    >
      {props.mode === "Chart" ? <Chart /> : <Workout />}
    </Button>
  );
};
