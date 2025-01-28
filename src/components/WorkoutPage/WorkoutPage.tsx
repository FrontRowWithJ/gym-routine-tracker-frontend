import { Workout } from "@/components/Workout";
import { WorkoutPageProps } from "./types";
import "./WorkoutPage.css";
import { Divider } from "@/components/Divider";
import { CreateButton } from "@/components/CreateButton";
import { CreateOrEditWorkoutDialog } from "@/components/CreateOrEditWorkoutDialog";
import { useState } from "react";
import { YoutubeVideoPlayer } from "@/components/YoutubeVideoPlayer";
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
  const [videoID, setVideoID] = useState("");
  const disableVideo = () => setVideoID("");
  return (
    <>
      <ErrorBanner />
      {videoID && (
        <>
          <YoutubeVideoPlayer disableVideo={disableVideo} videoID={videoID} />
          <Divider width="90%" margin="0.5rem" />
        </>
      )}
      {workouts.map((workout, key) => (
        <Fragment key={key}>
          <Workout
            workoutData={workout}
            enableVideo={() => setVideoID(workout.youtubeID)}
            PUT={putWorkout}
            POST={postWorkout}
            DELETE={deleteWorkout}
            debouncePUT={debouncePutWorkout}
          />
          <Divider width="90%" margin="0.5rem" />
        </Fragment>
      ))}
      <Divider backgroundColor="transparent" margin="2.5rem" />
      <CreateButton onClick={openDialog} label="Create Workout" />
      <Dialog
        label="Create"
        backgroundColor="#39304a"
        width="calc(100% - 2rem)"
        resetValue={{
          workoutName: "",
          repCount: 1,
          setCount: 1,
          unit: "N/A",
          indexNumber: 0,
          weight: 0,
          increment: 0,
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
