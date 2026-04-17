import { ConfirmDeleteDialogProps } from "@/components/ConfirmDeleteDialog";

export type DialogProps = {
  label: "Create" | "Edit";
  width?: string;
  reset: VoidFunction;
  save: VoidFunction;
  deleteAction?: VoidFunction;
} & React.DialogHTMLAttributes<HTMLDialogElement> &
  ConfirmDeleteDialogProps;
