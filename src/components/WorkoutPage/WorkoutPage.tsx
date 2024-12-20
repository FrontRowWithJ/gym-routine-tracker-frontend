import { Workout } from "@/components/Workout";
import { WorkoutPageProps } from "./types";
import "./WorkoutPage.css";
import { Divider } from "../Divider";
import { CreateButton } from "../CreateButton";
import { CreateOrEditWorkoutDialog } from "../CreateOrEditWorkoutDialog";
import { useState } from "react";
import { WorkoutData } from "@/misc";
import { YoutubeVideoPlayer } from "@/components/YoutubeVideoPlayer";
import { Fragment } from "react";
import { useWorkouts } from "@/misc/hooks";

const RESET_VALUE: WorkoutData = {
  workoutName: "",
  repCount: 1,
  setCount: 1,
  youtubeID: "",
  unit: "N/A",
  increment: 0,
  weight: 0,
  routineID: 0,
  workoutID: 0,
  indexNumber: 0,
};

export const WorkoutPage = (props: WorkoutPageProps) => {
  const [openDialog, Dialog] = CreateOrEditWorkoutDialog();
  const {
    workouts,
    putWorkout,
    postWorkout,
    deleteWorkout,
    debouncePutWorkout,
  } = useWorkouts(props.userID, props.routineID, props.setTrigger);
  const [videoID, setVideoID] = useState("");
  const disableVideo = () => setVideoID("");
  return (
    <>
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
        resetValue={RESET_VALUE}
        PUT={putWorkout}
        POST={postWorkout}
        DELETE={deleteWorkout}
      />
    </>
  );
};
