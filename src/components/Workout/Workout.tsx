import { Add, Minus, ThreeDots } from "@/resources/SVG";
import { WorkoutProps } from "./types";
import "./Workout.css";
import { Button } from "@/components/Button";
import { getYoutubeThumbnail } from "@/misc";
import { CreateOrEditWorkoutDialog } from "../CreateOrEditWorkoutDialog";

export const Workout = ({
  enableVideo,
  PUT,
  POST,
  DELETE,
  debouncePUT,
  workoutData,
}: WorkoutProps) => {
  const [openDialog, Dialog] = CreateOrEditWorkoutDialog();

  const src = getYoutubeThumbnail(workoutData.youtubeID);
  const unit = workoutData.unit === "N/A" ? "" : workoutData.unit;
  return (
    <>
      <article className="workout">
        <section className="left">
          <picture onClick={enableVideo}>
            {/*// FIXME default image when there is no source. */}
            <source srcSet={src} type="image/jpeg" />
            <img src={src} alt="workout" />
          </picture>
        </section>
        <section className="middle">
          <span className="workout-name">{workoutData.workoutName}</span>
          <div className="workout-buttons">
            <Button
              onClick={() => {
                const newWeight = workoutData.weight + workoutData.increment;
                debouncePUT({ ...workoutData, weight: newWeight });
              }}
            >
              <Add />
            </Button>
            <div>{`${workoutData.weight} ${unit}`}</div>
            <Button
              onClick={() => {
                const newWeight = Math.max(
                  0,
                  workoutData.weight - workoutData.increment
                );
                debouncePUT({ ...workoutData, weight: newWeight });
              }}
            >
              <Minus />
            </Button>
          </div>
          <div className="set-rep-info">
            <span>{`${workoutData.setCount} Set${
              workoutData.setCount === 1 ? "" : "s"
            }`}</span>
            <span>
              {`${workoutData.repCount} Rep${
                workoutData.repCount === 1 ? "" : "s"
              }`}
            </span>
          </div>
        </section>
        <section className="right">
          <Button onClick={openDialog}>
            <ThreeDots />
          </Button>
        </section>
      </article>

      <Dialog
        label="Edit"
        backgroundColor="#39304a"
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
