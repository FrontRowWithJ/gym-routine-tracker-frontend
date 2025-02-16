import { Add, Minus, PlayButton, ThreeDots } from "@/resources/SVG";
import { WorkoutProps } from "./types";
import "./Workout.css";
import { Button } from "@/components/Button";
import { getYoutubeThumbnail, hashString } from "@/misc";
import { CreateOrEditWorkoutDialog } from "@/components/CreateOrEditWorkoutDialog";
import { useMemo } from "react";
import { YoutubeVideoPlayer } from "@/components/YoutubeVideoPlayer";

const getHue = (s: string) => {
  const bytes = hashString(s);
  return (bytes[0] | ((bytes[1] & 0b1) << 8)) % 360;
};
export const Workout = ({
  PUT,
  POST,
  DELETE,
  debouncePUT,
  workoutData,
}: WorkoutProps) => {
  const [openDialog, Dialog] = CreateOrEditWorkoutDialog();
  const [openPlayer, YoutubePlayer] = YoutubeVideoPlayer();
  const src = getYoutubeThumbnail(workoutData.youtubeID);
  const unit = workoutData.unit === "N/A" ? "" : workoutData.unit;
  const { weight, increment, setCount, repCount, workoutName } = workoutData;
  const hue = useMemo(() => getHue(workoutName), [workoutName]);
  return (
    <>
      {src && <YoutubePlayer videoID={workoutData.youtubeID} />}
      <article
        className="workout frosted-glass"
        style={{ "--hue": hue } as React.CSSProperties}
      >
        {src && (
          <section className="left">
            <picture onClick={openPlayer}>
              <source srcSet={src} type="image/jpeg" />
              <img src={src} alt="tutorial thumbnail" />
            </picture>
            <PlayButton onClick={openPlayer} />
          </section>
        )}
        <section className="middle">
          <span>{workoutName}</span>
          <span>
            {`${setCount} Set${setCount === 1 ? "" : "s"}`}
            &nbsp;&nbsp;
            {`${repCount} Rep${repCount === 1 ? "" : "s"}`}
          </span>
          <div className="workout-buttons">
            <Button
              onClick={() =>
                debouncePUT({ ...workoutData, weight: weight + increment })
              }
            >
              <Add />
            </Button>
            <span>{`${weight} ${unit}`}</span>
            <Button
              onClick={() => {
                const newWeight = Math.max(0, weight - increment);
                debouncePUT({ ...workoutData, weight: newWeight });
              }}
            >
              <Minus />
            </Button>
          </div>
        </section>
        <Button className="right" onClick={openDialog}>
          <ThreeDots />
        </Button>
      </article>
      <Dialog
        label="Edit"
        className="edit-workout-dialog"
        width="calc(100% - 2rem)"
        resetValue={workoutData}
        title="Permanently Delete Workout?"
        subtitle="This workout will be permanently deleted."
        PUT={PUT}
        POST={POST}
        DELETE={DELETE}
      />
    </>
  );
};
