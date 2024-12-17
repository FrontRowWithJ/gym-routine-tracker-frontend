import { DialogProps } from "./types";
import "./FormDialog.css";
import { useRef } from "react";
import { Button } from "@/components/Button";
import { Bin, Close, Save, Undo } from "@/resources/SVG";
import { Divider } from "@/components/Divider";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

export const FormDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openDialog = (event: React.BaseSyntheticEvent) => {
    event.stopPropagation();
    dialogRef.current?.showModal();
  };
  const closeDialog = (event: React.BaseSyntheticEvent) => {
    event.stopPropagation();
    dialogRef.current?.close();
  };

  const [openConfirmDialog, closeConfirmDialog, ConfirmDialog] =
    ConfirmDeleteDialog();

  const Dialog = ({
    children,
    className = "",
    label,
    backgroundColor,
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
        <dialog
          className={`dialog ${className}`}
          {...dialogProps}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              event.stopPropagation();
              event.currentTarget.close();
            }
          }}
          ref={dialogRef}
        >
          <form
            style={{ backgroundColor, width }}
            action=""
            onSubmit={(event) => {
              event.preventDefault();
              save();

              closeConfirmDialog(event);
              closeDialog(event);
            }}
          >
            <header>
              <Button type="button" onClick={closeDialog}>
                <Close />
              </Button>
              <span>{label}</span>
            </header>
            <Divider width="100%" margin=".5rem" />
            {children}
            <Divider width="100%" margin=".5rem" />
            <footer>
              <Button type="button" onClick={reset}>
                <Undo />
              </Button>
              <Button
                type="button"
                className="delete-button"
                disabled={label === "Create"}
                onClick={(event) => {
                  openConfirmDialog(event);
                }}
              >
                <Bin />
              </Button>
              <Button type="submit">
                <Save />
              </Button>
            </footer>
          </form>
        </dialog>
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
