import { ConfirmDeleteDialogProps } from "@/components/ConfirmDeleteDialog";

export type DialogProps = {
  label: "Create" | "Edit";
  backgroundColor: string;
  width?: string;
  reset: () => void;
  save: () => void;
  deleteAction?: () => void;
} & React.DialogHTMLAttributes<HTMLDialogElement> &
  ConfirmDeleteDialogProps;
