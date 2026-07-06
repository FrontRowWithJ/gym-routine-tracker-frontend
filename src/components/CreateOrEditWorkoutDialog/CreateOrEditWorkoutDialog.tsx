import { CreateOrEditWorkoutDialogProps, Action } from "./types";
import "./CreateOrEditWorkoutDialog.css";
import { Input } from "@/components/Input";
import { RadioGroup } from "@/components/RadioGroup";
import { useReducer } from "react";
import { FormDialog } from "@/components/FormDialog";
import { validateName, WorkoutData } from "@/misc";
import { Counter } from "@/components/Counter";
import UrlParser from "js-video-url-parser";

const reducer = (state: WorkoutData, { type, value }: Action): WorkoutData => {
  switch (type) {
    case "reset": {
      const { routineID, workoutID } = state;
      return { ...value, routineID, workoutID };
    }
    default:
      return { ...state, [type]: value };
  }
};

const validateYoutubeURL = (url: string) => {
  return url && UrlParser.parse(url) === undefined
    ? "Please enter a valid Youtube url."
    : "";
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
    const { youtubeID } = resetValue;
    const rv: WorkoutData = {
      ...resetValue,
      youtubeID: youtubeID
        ? `https://www.youtube.com/watch?v=${youtubeID}`
        : "",
    };
    const [workoutData, dispatch] = useReducer(reducer, rv);
    return (
      <DialogWrapper
        {...dialogProps}
        onClose={() => dispatch({ type: "reset", value: rv })}
        reset={() => dispatch({ type: "reset", value: rv })}
        save={() => {
          const id = UrlParser.parse(workoutData.youtubeID)?.id ?? "";
          const payload: WorkoutData = { ...workoutData, youtubeID: id };
          if (dialogProps.label === "Create") POST(payload);
          else PUT(payload);
        }}
        deleteAction={() => DELETE(workoutData)}
      >
        <div className="create-or-edit-workout-container">
          <Input
            required
            placeholder="name"
            minLength={1}
            maxLength={100}
            value={workoutData.workoutName}
            onInput={({ currentTarget }) => {
              currentTarget.setCustomValidity(
                validateName(currentTarget.value),
              );
            }}
            onChange={({ target: { value } }) =>
              dispatch({ type: "workoutName", value })
            }
          />
          <div className="numerical-input-wrapper">
            <Input
              min={1}
              required
              placeholder="Number of sets"
              type="number"
              value={workoutData.setCount}
              onChange={({ target: { value } }) =>
                dispatch({
                  type: "setCount",
                  value: value ? +value : workoutData.setCount,
                })
              }
            />
            <Input
              required
              min={1}
              placeholder="Reps per set"
              type="number"
              value={workoutData.repCount}
              onChange={({ target: { value } }) => {
                dispatch({
                  type: "repCount",
                  value: value ? +value : workoutData.repCount,
                });
              }}
            />
          </div>
          <RadioGroup
            name="Units"
            values={["N/A", "kg", "s", "mins"]}
            value={workoutData.unit}
            onChange={(value) => dispatch({ type: "unit", value })}
          />

          <div className="numerical-input-wrapper">
            <Input
              min={1}
              required
              placeholder="increment"
              type="text"
              value={workoutData.increment}
              onChange={({ target: { value } }) => {
                let newValue: number;
                if (value === "") {
                  newValue = 0;
                } else if (!isNaN(+value)) {
                  newValue = +value;
                } else {
                  newValue = workoutData.increment;
                }
                dispatch({ type: "increment", value: newValue });
              }}
            />
            <Counter
              placeholder="Weight"
              increment={() => {
                dispatch({
                  type: "weight",
                  value: workoutData.weight + workoutData.increment,
                });
              }}
              value={workoutData.weight}
              decrement={() => {
                dispatch({
                  type: "weight",
                  value: Math.max(
                    0,
                    workoutData.weight - workoutData.increment,
                  ),
                });
              }}
            />
          </div>
          <Input
            placeholder="Youtube Tutorial"
            type="text"
            value={workoutData.youtubeID}
            onInput={({ currentTarget }) =>
              currentTarget.setCustomValidity(
                validateYoutubeURL(currentTarget.value),
              )
            }
            onChange={({ target: { value } }) =>
              dispatch({ type: "youtubeID", value })
            }
          />
        </div>
      </DialogWrapper>
    );
  };

  return [openDialog, Dialog] as const;
};
