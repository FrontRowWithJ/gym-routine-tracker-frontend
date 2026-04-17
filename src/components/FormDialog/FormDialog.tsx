import { DialogProps } from "./types";
import "./FormDialog.css";
import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Bin, Close, Save, Undo } from "@/resources/SVG";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useWindowEvent } from "@/misc/hooks";

export const FormDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const openDialog = (event: React.BaseSyntheticEvent) => {
    event.stopPropagation();
    setIsDialogOpen(true);
  };

  const closeDialog = (event: React.BaseSyntheticEvent) => {
    event.stopPropagation();
    setIsDialogOpen(false);
  };

  const [openConfirmDialog, closeConfirmDialog, ConfirmDialog] =
    ConfirmDeleteDialog();

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

  const Dialog = ({
    children,
    className = "",
    label,
    width,
    reset,
    deleteAction,
    save,
    title,
    subtitle,
    ...dialogProps
  }: DialogProps) => {
    return (
      <>
        {isDialogOpen && (
          <dialog
            open
            className={`dialog ${className}`}
            {...dialogProps}
            onClick={(event) => {
              if (event.target === event.currentTarget) closeDialog(event);
            }}
          >
            <form
              style={{ width }}
              ref={formRef}
              action=""
              onSubmit={(event) => {
                event.preventDefault();
                save();
                closeConfirmDialog(event);
                closeDialog(event);
              }}
              className={"frosted-glass"}
            >
              <header>
                <Button type="button" onClick={closeDialog}>
                  <Close />
                </Button>
                <span>{label}</span>
              </header>
              {children}
              <footer>
                <Button
                  type="button"
                  onClick={() => {
                    reset();
                    formRef.current?.reset();
                  }}
                >
                  <Undo />
                </Button>
                <Button
                  type="button"
                  className="delete-button"
                  disabled={label === "Create"}
                  onClick={openConfirmDialog}
                >
                  <Bin />
                </Button>
                <Button type="submit">
                  <Save />
                </Button>
              </footer>
            </form>
          </dialog>
        )}
        <ConfirmDialog
          title={title}
          subtitle={subtitle}
          deleteAction={(event) => {
            deleteAction?.();
            closeConfirmDialog(event);
            closeDialog(event);
          }}
        />
      </>
    );
  };
  return [openDialog, Dialog] as const;
};
