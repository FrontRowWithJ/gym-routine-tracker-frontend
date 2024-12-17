import { CreateOrEditWorkoutDialogProps, Action } from "./types";
import "./CreateOrEditWorkoutDialog.css";
import { Input } from "@/components/Input";
import { RadioGroup } from "@/components/RadioGroup";
import { Minus, Add } from "@/resources/SVG";
import { Button } from "@/components/Button";
import { useReducer } from "react";
import { FormDialog } from "@/components/FormDialog";
import {
  FormState,
  genDefaultFormState,
  validateName,
  validateNumber,
  validateYoutubeLink,
  WorkoutData,
  YOUTUBE_ID_LENGTH,
} from "@/misc";

const validateN = (value: string) => validateNumber(value, 1);
const validators = {
  unit: () => "",
  weight: () => "",
  workoutName: validateName,
  setCount: validateN,
  repCount: validateN,
  increment: validateN,
  youtubeID: validateYoutubeLink,
  indexNumber: () => "",
};

const reducer = (
  state: FormState<WorkoutData>,
  action: Action
): FormState<WorkoutData> => {
  switch (action.type) {
    case "reset":
      return {
        ...action.value,
        routineID: state.routineID,
        workoutID: state.workoutID,
      };
    default:
      return {
        ...state,
        [action.type]: {
          value: action.value,
          error: validators[action.type]("" + action.value),
        },
      };
  }
};

const toWorkoutData = (state: FormState<WorkoutData>): WorkoutData => {
  return {
    routineID: state.routineID.value,
    workoutID: state.workoutID.value,
    workoutName: state.workoutName.value,
    setCount: state.setCount.value,
    repCount: state.repCount.value,
    unit: state.unit.value,
    increment: state.increment.value,
    weight: state.weight.value,
    youtubeID: state.youtubeID.value,
    indexNumber: state.indexNumber.value,
  };
};

export const CreateOrEditWorkoutDialog = () => {
  const [openDialog, DialogWrapper] = FormDialog();

  const Dialog = ({
    resetValue,
    PUT,
    POST,
    DELETE,
    ...dialogProps
  }: CreateOrEditWorkoutDialogProps) => {
    const defaultFormState = genDefaultFormState(resetValue);
    const [state, dispatch] = useReducer(reducer, defaultFormState);

    return (
      <DialogWrapper
        {...dialogProps}
        onClose={() => dispatch({ type: "reset", value: defaultFormState })}
        reset={() => dispatch({ type: "reset", value: defaultFormState })}
        save={() => {
          const workoutData = toWorkoutData(state);
          const { routineID, workoutID, indexNumber, ...payload } = workoutData;
          if (dialogProps.label === "Create") POST(payload);
          else PUT(workoutData);
        }}
        deleteAction={() => DELETE(toWorkoutData(state))}
      >
        <div className="create-or-edit-workout-container">
          <Input
            required
            placeholder="name"
            minLength={1}
            maxLength={100}
            focusColor="#e9e9ed"
            backgroundColor="#39304a"
            value={state.workoutName.value}
            errorMessage={state.workoutName.error}
            onChange={({ target: { value } }) =>
              dispatch({ type: "workoutName", value })
            }
          />
          <div className="numerical-input-wrapper">
            <Input
              min={1}
              required
              placeholder="Number of sets"
              focusColor="#e9e9ed"
              backgroundColor="#39304a"
              type="number"
              value={state.setCount.value}
              errorMessage={state.setCount.error}
              onChange={({ target: { value } }) =>
                dispatch({ type: "setCount", value: +value })
              }
            />
            <Input
              required
              min={1}
              placeholder="Reps per set"
              focusColor="#e9e9ed"
              backgroundColor="#39304a"
              type="number"
              value={state.repCount.value}
              errorMessage={state.repCount.error}
              onChange={({ target: { value } }) =>
                dispatch({ type: "repCount", value: +value })
              }
            />
          </div>
          <RadioGroup
            name="Units"
            values={["N/A", "kg", "s", "mins"]}
            value={state.unit.value}
            onChange={(value) => dispatch({ type: "unit", value })}
          />

          <div className="numerical-input-wrapper">
            <Input
              required
              placeholder="increment"
              focusColor="#e9e9ed"
              backgroundColor="#39304a"
              type="number"
              value={state.increment.value}
              errorMessage={state.increment.error}
              onChange={({ target: { value } }) =>
                dispatch({ type: "increment", value: +value })
              }
            />
            <div className="weight-counter">
              <label style={{ backgroundColor: "#39304a" }}>Weight</label>
              <Button
                type="button"
                onClick={() => {
                  dispatch({
                    type: "weight",
                    value: state.weight.value + state.increment.value,
                  });
                }}
              >
                <Add />
              </Button>
              <div>{`${state.weight.value}`}</div>
              <Button
                type="button"
                onClick={() => {
                  dispatch({
                    type: "weight",
                    value: Math.max(
                      0,
                      state.weight.value - state.increment.value
                    ),
                  });
                }}
              >
                <Minus />
              </Button>
            </div>
          </div>
          <Input
            placeholder="Youtube Tutorial Video ID"
            focusColor="#e9e9ed"
            type="pattern"
            minLength={YOUTUBE_ID_LENGTH}
            maxLength={YOUTUBE_ID_LENGTH}
            backgroundColor="#39304a"
            pattern={`^[\\w\\-_]{${YOUTUBE_ID_LENGTH}}$`}
            value={state.youtubeID.value}
            errorMessage={state.youtubeID.error}
            onChange={({ target: { value } }) => {
              dispatch({ type: "youtubeID", value });
            }}
          />
        </div>
      </DialogWrapper>
    );
  };

  return [openDialog, Dialog] as const;
};
