import { DialogProps } from "./types";
import "./FormDialog.css";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Bin, Close, Save, Undo } from "@/resources/SVG";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { OPEN, CLOSE } from "@/misc";

export const FormDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(CLOSE);
  const formRef = useRef<HTMLFormElement>(null);
  const openDialog = (event: React.BaseSyntheticEvent) => {
    event.stopPropagation();
    setIsDialogOpen(OPEN);
  };
  const closeDialog = (event: React.BaseSyntheticEvent) => {
    event.stopPropagation();
    setIsDialogOpen(CLOSE);
  };

  const [openConfirmDialog, closeConfirmDialog, ConfirmDialog] =
    ConfirmDeleteDialog();

  useEffect(() => {
    if (!isDialogOpen) return;
    const controller = new AbortController();
    window.addEventListener(
      "keydown",
      ({ code }) => code === "Escape" && setIsDialogOpen(CLOSE),
      { signal: controller.signal }
    );
    return () => controller.abort();
  }, [isDialogOpen]);

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
