import { RoutineProps } from "./types";
import "./Routine.css";
import { DottedPattern, Settings } from "@/resources/SVG";
import { Button } from "@/components/Button";
import { CreateOrEditRoutineDialog } from "@/components/CreateOrEditRoutineDialog";

export const Routine = (props: RoutineProps) => {
  const [openDialog, Dialog] = CreateOrEditRoutineDialog();
  const workoutCount = props.routineData.workoutCount;

  return (
    <>
      <article className="routine" onClick={props.setPage}>
        <Button className="frosted-glass" onClick={openDialog}>
          <Settings />
        </Button>
        <DottedPattern name={props.routineData.routineName} />
        <article className="frosted-glass">
          <header>{props.routineData.routineName}</header>
          <h5>{`${workoutCount} Workout${workoutCount === 1 ? "" : "s"}`}</h5>
        </article>
      </article>
      <Dialog
        label="Edit"
        className="edit-routine-dialog"
        title="Permanently Delete Routine?"
        subtitle="The routine and it's associated workouts will be permanently deleted."
        PUT={props.PUT}
        POST={props.POST}
        DELETE={props.DELETE}
        resetValue={props.routineData}
      />
    </>
  );
};
