import { RoutinePageProps } from "./types";
import "./RoutinePage.css";
import { Routine } from "@/components/Card";
import { CreateButton } from "@/components/CreateButton";
import { CreateOrEditRoutineDialog } from "@/components/CreateOrEditRoutineDialog";
import { WorkoutPage } from "@/components/WorkoutPage";
import { useState } from "react";
import { useRoutines } from "@/misc/hooks";
import { useErrorBanner } from "@/components/ErrorBanner";

export const RoutinePage = (props: RoutinePageProps) => {
  const [openDialog, Dialog] = CreateOrEditRoutineDialog();
  const [trigger, setTrigger] = useState<{}>({});
  const [ErrorBanner, setErrorMessage] = useErrorBanner();
  const { routines, putRoutine, postRoutine, deleteRoutine } = useRoutines(
    props.userID,
    trigger,
    setErrorMessage
  );
  const [routineID, setRoutineID] = useState<number>();
  return (
    <>
      <ErrorBanner />
      <article className="routine-page">
        {props.page === "Routine" ? (
          <>
            {routines.map((routineData, key) => (
              <Routine
                key={key}
                routineData={routineData}
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
                userID: props.userID,
                routineID: -1,
                routineName: "",
                indexNumber: 1024,
                workoutCount: 0,
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
              setTrigger={setTrigger}
            />
          )
        )}
      </article>
    </>
  );
};
