import { ConfirmDeleteDialogProps } from "./types";
import "./ConfirmDeleteDialog.css";
import { useRef } from "react";
import { Button } from "@/components/Button";
import { PermanentBin } from "@/resources/SVG";

export const ConfirmDeleteDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = (event: React.BaseSyntheticEvent) => {
    event.stopPropagation();
    dialogRef.current?.showModal();
  };

  const closeDialog = (event: React.BaseSyntheticEvent) => {
    event.stopPropagation();
    dialogRef.current?.close();
  };

  const Dialog = (props: ConfirmDeleteDialogProps) => (
    <dialog
      ref={dialogRef}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          event.stopPropagation();
          event.currentTarget.close();
        }
      }}
      className="confirm-delete-dialog"
    >
      <article>
        <PermanentBin />
        <h1>{props.title}</h1>
        <h5>{props.subtitle}</h5>
        <section>
          <Button onClick={props.deleteAction}>Delete</Button>
          <Button onClick={closeDialog}>Cancel</Button>
        </section>
      </article>
    </dialog>
  );

  return [openDialog, closeDialog, Dialog] as const;
};
