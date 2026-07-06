import { Workout } from "@/components/Workout";
import { WorkoutPageProps } from "./types";
import "./WorkoutPage.css";
import { Divider } from "@/components/Divider";
import { CreateButton } from "@/components/CreateButton";
import { CreateOrEditWorkoutDialog } from "@/components/CreateOrEditWorkoutDialog";
import { Fragment } from "react";
import { useWorkouts } from "@/misc/hooks";
import { useErrorBanner } from "@/components/ErrorBanner";
import { TimerDialog } from "@/components/TimerDialog";
import { Button } from "../Button";
import { Timer } from "@/resources/SVG";

export const WorkoutPage = ({
  userID,
  routineID,
  setTrigger,
}: WorkoutPageProps) => {
  const [openDialog, Dialog] = CreateOrEditWorkoutDialog();
  const [ErrorBanner, setErrorMessage] = useErrorBanner();
  const { workouts, putWorkout, postWorkout, deleteWorkout } = useWorkouts(
    userID,
    routineID,
    setTrigger,
    setErrorMessage,
  );
  const [open, TimerScreen] = TimerDialog();
  return (
    <>
      <ErrorBanner />
      {workouts.map((workout, key) => (
        <Fragment key={key}>
          <Workout
            workoutData={workout}
            PUT={putWorkout}
            POST={postWorkout}
            DELETE={deleteWorkout}
          />
          <Divider width="90%" margin="0.5rem" />
        </Fragment>
      ))}
      <Divider backgroundColor="red" margin="2.5rem" />
      <Button className="timer-button static-noise" onClick={open}>
        <Timer />
      </Button>
      <CreateButton
        onClick={openDialog}
        label="Create Workout"
        className="create-workout-button"
      />
      <TimerScreen />
      <Dialog
        label="Create"
        className="create-workout-dialog"
        width="calc(100% - 2rem)"
        resetValue={{
          workoutName: "",
          repCount: 1,
          setCount: 1,
          unit: "N/A",
          indexNumber: 0,
          weight: 0,
          increment: 1,
          youtubeID: "",
          workoutID: -1,
          routineID,
        }}
        PUT={putWorkout}
        POST={postWorkout}
        DELETE={deleteWorkout}
      />
    </>
  );
};
