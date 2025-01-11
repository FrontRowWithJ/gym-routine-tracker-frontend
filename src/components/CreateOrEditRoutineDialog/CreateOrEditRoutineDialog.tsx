import { CreateOrEditRoutineDialogProps, Action } from "./types";
import "./CreateOrEditRoutineDialog.css";
import { Input } from "@/components/Input";
import { useReducer } from "react";
import { FormDialog } from "@/components/FormDialog";
import {
  RoutineData,
  FormState,
  genDefaultFormState,
  validateName,
} from "@/misc";

const reducer = (
  state: FormState<RoutineData>,
  { type, value }: Action
): FormState<RoutineData> => {
  switch (type) {
    case "reset":
      return { ...value, routineID: state.routineID, userID: state.userID };
    case "routineName":
      return { ...state, routineName: { value, error: validateName(value) } };
    default:
      return state;
  }
};

const toRoutineData = (state: FormState<RoutineData>): RoutineData => {
  return {
    routineName: state.routineName.value,
    userID: state.userID.value,
    routineID: state.routineID.value,
    indexNumber: state.indexNumber.value,
    workoutCount: state.workoutCount.value,
  };
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
    const defaultFormState = genDefaultFormState(resetValue);
    const [state, dispatch] = useReducer(reducer, defaultFormState);
    return (
      <DialogWrapper
        {...dialogProps}
        reset={() => dispatch({ type: "reset", value: defaultFormState })}
        onClose={() => dispatch({ type: "reset", value: defaultFormState })}
        save={() => {
          const routineData = toRoutineData(state);
          if (dialogProps.label === "Create") {
            POST(routineData);
          } else PUT(routineData);
        }}
        deleteAction={() => DELETE(toRoutineData(state))}
      >
        <div className="create-or-edit-routine-container">
          <Input
            required
            minLength={1}
            maxLength={64}
            type="text"
            className="name-input"
            placeholder="name"
            backgroundColor="brown"
            focusColor="white"
            value={state.routineName.value}
            errorMessage={state.routineName.error}
            onChange={({ target: { value } }) => {
              dispatch({ type: "routineName", value });
            }}
          />
        </div>
      </DialogWrapper>
    );
  };
  return [openDialog, Dialog] as const;
};
