import { RoutinePageProps } from "./types";
import "./RoutinePage.css";
import { Routine } from "@/components/Card";
import { CreateButton } from "@/components/CreateButton";
import { CreateOrEditRoutineDialog } from "@/components/CreateOrEditRoutineDialog";
import { WorkoutPage } from "@/components/WorkoutPage";
import { useState } from "react";
import { useRoutines } from "@/misc/hooks";

export const RoutinePage = (props: RoutinePageProps) => {
  const [openDialog, Dialog] = CreateOrEditRoutineDialog();
  const { routines, putRoutine, postRoutine, deleteRoutine } = useRoutines(
    props.userID
  );
  const [routineID, setRoutineID] = useState<number>();
  // check logged in by using checking localstorage for google-token
  return (
    <article className="routine-page">
      {props.page === "Routine" ? (
        <>
          {routines.map((routineData, key) => (
            <Routine
              key={key}
              routineData={routineData}
              // workoutCount={workoutCount}
              setPage={() => {
                setRoutineID(routineData.routineID);
                props.setPage("Workout");
              }}
              PUT={putRoutine}
              POST={postRoutine}
              DELETE={deleteRoutine}
            />
          ))}

          <CreateButton onClick={openDialog} label="Create Routine" />
          <Dialog
            label="Create"
            backgroundColor="brown"
            resetValue={{
              userID: -1,
              routineID: -1,
              routineName: "",
              indexNumber: 2048,
            }}
            PUT={putRoutine}
            POST={postRoutine}
            DELETE={deleteRoutine}
          />
        </>
      ) : (
        routineID !== undefined && (
          <WorkoutPage
            setPage={props.setPage}
            routineID={routineID}
            userID={props.userID}
          />
        )
      )}
    </article>
  );
};
