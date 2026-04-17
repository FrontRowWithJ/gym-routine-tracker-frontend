import { TimerDialogProps } from "./types";
import "./TimerDialog.css";
import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Timer } from "@/components/Timer";
import { useWindowEvent } from "@/misc/hooks";
import { Close } from "@/resources/SVG";

export const TimerDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const toggleDialog = (isOpen: boolean) => {
    return (event: React.BaseSyntheticEvent) => {
      event.stopPropagation();
      setIsDialogOpen(isOpen);
    };
  };
  const openDialog = toggleDialog(true);
  const closeDialog = toggleDialog(false);

  useWindowEvent(
    "keydown",
    ({ code }) => {
      if (!isDialogOpen) return;
      if (code === "Escape") {
        setIsDialogOpen(false);
      }
    },
    [isDialogOpen],
  );

  const Dialog = (props: TimerDialogProps) => {
    return (
      <>
        {isDialogOpen && (
          <dialog
            open
            ref={dialogRef}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeDialog(event);
              }
            }}
            className="timer-dialog"
          >
            <article className="frosted-glass">
              <Timer />
              <Button onClick={closeDialog}>
                <Close />
              </Button>
            </article>
          </dialog>
        )}
      </>
    );
  };

  return [openDialog, Dialog] as const;
};
