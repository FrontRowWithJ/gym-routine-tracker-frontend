import { CreateOrEditRoutineDialogProps, Action } from "./types";
import "./CreateOrEditRoutineDialog.css";
import { Input } from "@/components/Input";
import { useReducer } from "react";
import { FormDialog } from "@/components/FormDialog";
import { RoutineData, validateName } from "@/misc";

const reducer = (state: RoutineData, { type, value }: Action): RoutineData => {
  switch (type) {
    case "reset":
      return { ...value, routineID: state.routineID, userID: state.userID };
    default:
      return { ...state, [type]: value };
  }
};

export const CreateOrEditRoutineDialog = () => {
  const [openDialog, DialogWrapper] = FormDialog();
  const Dialog = ({
    resetValue,
    PUT,
    POST,
    DELETE,
    ...dialogProps
  }: CreateOrEditRoutineDialogProps) => {
    const [state, dispatch] = useReducer(reducer, resetValue);
    const save = dialogProps.label === "Create" ? POST : PUT;
    return (
      <DialogWrapper
        {...dialogProps}
        reset={() => dispatch({ type: "reset", value: resetValue })}
        onClose={() => dispatch({ type: "reset", value: resetValue })}
        save={() => save(state)}
        deleteAction={() => DELETE(state)}
      >
        <div className="create-or-edit-routine-container">
          <Input
            required
            minLength={1}
            maxLength={64}
            type="text"
            placeholder="name"
            value={state.routineName}
            onInput={({ currentTarget }) =>
              currentTarget.setCustomValidity(validateName(currentTarget.value))
            }
            onChange={({ target }) =>
              dispatch({ type: "routineName", value: target.value })
            }
          />
        </div>
      </DialogWrapper>
    );
  };
  return [openDialog, Dialog] as const;
};
