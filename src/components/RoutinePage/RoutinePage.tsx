import { RoutinePageProps } from "./types";
import "./RoutinePage.css";
import { Routine } from "@/components/Card";
import { CreateButton } from "@/components/CreateButton";
import { CreateOrEditRoutineDialog } from "@/components/CreateOrEditRoutineDialog";
import { WorkoutPage } from "@/components/WorkoutPage";
import { useState } from "react";
import { useRoutines } from "@/misc/hooks";
import { useErrorBanner } from "@/components/ErrorBanner";

export const RoutinePage = ({
  page,
  userID,
  setPageAndPageName,
}: RoutinePageProps) => {
  const [openDialog, Dialog] = CreateOrEditRoutineDialog();
  // used to force a render update after the number of routines change
  const [trigger, setTrigger] = useState<{}>({});
  const [ErrorBanner, setErrorMessage] = useErrorBanner();
  const { routines, putRoutine, postRoutine, deleteRoutine } = useRoutines(
    userID,
    trigger,
    setErrorMessage
  );
  const [routineID, setRoutineID] = useState<number>();
  return (
    <>
      <ErrorBanner />
      <article className="routine-page">
        {page === "Routine" ? (
          <>
            {routines.map((routineData, key) => (
              <Routine
                key={key}
                routineData={routineData}
                setPage={() => {
                  setRoutineID(routineData.routineID);
                  setPageAndPageName(routineData.routineName);
                }}
                PUT={putRoutine}
                POST={postRoutine}
                DELETE={deleteRoutine}
              />
            ))}
            <CreateButton onClick={openDialog} label="Create Routine" />
            <Dialog
              className="create-routine-dialog"
              label="Create"
              resetValue={{
                userID,
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
            <WorkoutPage {...{ routineID, userID, setTrigger }} />
          )
        )}
      </article>
    </>
  );
};
