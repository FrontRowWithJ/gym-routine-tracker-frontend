import { Workout } from "@/components/Workout";
import { WorkoutPageProps } from "./types";
import "./WorkoutPage.css";
import { Divider } from "@/components/Divider";
import { CreateButton } from "@/components/CreateButton";
import { CreateOrEditWorkoutDialog } from "@/components/CreateOrEditWorkoutDialog";
import { Fragment } from "react";
import { useWorkouts } from "@/misc/hooks";
import { useErrorBanner } from "@/components/ErrorBanner";

export const WorkoutPage = ({
  userID,
  routineID,
  setTrigger,
}: WorkoutPageProps) => {
  const [openDialog, Dialog] = CreateOrEditWorkoutDialog();
  const [ErrorBanner, setErrorMessage] = useErrorBanner();
  const {
    workouts,
    putWorkout,
    postWorkout,
    deleteWorkout,
    debouncePutWorkout,
  } = useWorkouts(userID, routineID, setTrigger, setErrorMessage);
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
            debouncePUT={debouncePutWorkout}
          />
          <Divider width="90%" margin="0.5rem" />
        </Fragment>
      ))}
      <CreateButton onClick={openDialog} label="Create Workout" />
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
