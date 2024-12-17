import { RoutineProps } from "./types";
import "./Routine.css";
import { RoutineIcon, ThreeDots } from "@/resources/SVG";
import { Button } from "@/components/Button";
import { CreateOrEditRoutineDialog } from "@/components/CreateOrEditRoutineDialog";
import { genIconProps } from "@/misc";

export const Routine = (props: RoutineProps) => {
  const [openDialog, Dialog] = CreateOrEditRoutineDialog();
  const routineIconProps = genIconProps(props.routineData.routineName);
  return (
    <>
      <article className="routine" onClick={props.setPage}>
        <Button className="edit-button" onClick={openDialog}>
          <ThreeDots className="action-button-icon" />
        </Button>

        <RoutineIcon {...routineIconProps} />
        <article>
          <header>{props.routineData.routineName}</header>
          {/* TODO Add workoutCount Label */}
          {/* <h5>{`${workoutCount} Workout${workoutCount === 1 ? "" : "s"}`}</h5> */}
        </article>
      </article>

      <Dialog
        label="Edit"
        backgroundColor="brown"
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
