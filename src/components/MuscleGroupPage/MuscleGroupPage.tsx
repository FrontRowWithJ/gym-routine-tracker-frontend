import { Workout } from "./Workout";
import { MuscleGroupPageProps } from "./types";
import "./MuscleGroupPage.css";
import React, { useRef, useState } from "react";
import { type WorkoutData } from "../../misc";
import { EditPage as AddPage } from "./Workout/EditPage";

// This takes in a state and some data, modifies the current state
// using the data and returns a new State

type Reducer = (
  state: WorkoutData[],
  index: number,
  workoutData?: WorkoutData
) => WorkoutData[];

const increment: Reducer = (state, index) => {
  const workout = state[index];
  const newWorkout = {
    ...workout,
    amount: workout["amount"] + workout["unitAmount"],
  };
  return state.toSpliced(index, 1, newWorkout);
};

const decrement: Reducer = (state, index) => {
  const workout = state[index];
  const newWorkout = {
    ...workout,
    amount: Math.max(0, workout["amount"] - workout["unitAmount"]),
  };
  return state.toSpliced(index, 1, newWorkout);
};

const update: Reducer = (state, index, newWorkout) => {
  return !!newWorkout ? state.toSpliced(index, 1, newWorkout) : state;
};

const remove: Reducer = (state, index) => {
  return state.toSpliced(index, 1);
};

const add: Reducer = (state, _, newWorkout) => {
  return !!newWorkout ? [...state, newWorkout] : state;
};

const record: Record<
  ActionType,
  { reducer: Reducer; method: "PUT" | "POST" | "DELETE"; url: string }
> = {
  increment: {
    url: "",
    reducer: increment,
    method: "PUT",
  },
  decrement: {
    url: "",
    reducer: decrement,
    method: "PUT",
  },
  update: {
    url: "",
    reducer: update,
    method: "PUT",
  },
  remove: {
    url: "",
    reducer: remove,
    method: "DELETE",
  },
  add: {
    url: "",
    reducer: add,
    method: "POST",
  },
};

const useAction = () => {
  const [currState, setState] = useState<WorkoutData[]>([]);
  const canFetchRef = useRef<{ [key in ActionType]: boolean }>({
    increment: true,
    decrement: true,
    update: true,
    remove: true,
    add: true,
  });

  const dispatch = (
    actionType: ActionType,
    index: number,
    workoutData?: WorkoutData
  ) => {
    if (canFetchRef.current[actionType] === false) return;
    canFetchRef.current[actionType] = false;
    const { url, method, reducer } = record[actionType];
    
    if (actionType === "add") {
      fetch(url, { method, body: JSON.stringify(workoutData) })
        .then(async (response) => {
          const workoutData: WorkoutData = await response.json();
          const newState = reducer(currState, index, workoutData);
          setState(newState);
        })
        .finally(() => {
          canFetchRef.current[actionType] = true;
        });
    } else {
      let newState: WorkoutData[];
      let data: WorkoutData;
      if (actionType === "remove") {
        data = currState[index];
        newState = reducer(currState, index);
      } else {
        newState = reducer(currState, index, workoutData);
        data = newState[index];
      }
      fetch(url, { method, body: JSON.stringify(data) })
        .then(() => {
          setState(newState);
          // todo update Local Storage
        })
        .catch((reason) => {
          //todo show reason
        })
        .finally(() => {
          canFetchRef.current[actionType] = true;
        });
    }
  };
  return [currState, dispatch] as const;
};

type ActionType = "increment" | "decrement" | "update" | "remove" | "add";

export const MuscleGroupPage = (props: MuscleGroupPageProps) => {
  const { pageName, goBack, routineID } = props;
  const [workoutData, setWorkoutData] = useAction();
  const [canAddNewWorkout, setCanAddNewWorkout] = useState(false);

  return (
    <main className="muscle-group-page">
      <button onClick={goBack}>Back</button>
      <h1>{pageName}</h1>
      {workoutData.map((data, index) => (
        <Workout
          key={index}
          {...data}
          increment={() => setWorkoutData("increment", index)}
          decrement={() => setWorkoutData("decrement", index)}
          remove={() => setWorkoutData("remove", index)}
          update={(data) => setWorkoutData("update", index, data)}
        />
      ))}
      <button onClick={() => setCanAddNewWorkout(true)}>Add Workout</button>
      {canAddNewWorkout && (
        <AddPage
          routineID={routineID}
          workoutName=""
          amount={0}
          repCount={0}
          setCount={0}
          unit=""
          unitAmount={0}
          tutorialLink=""
          disable={() => setCanAddNewWorkout(false)}
          update={(data) => setWorkoutData("add", workoutData.length, data)}
        />
      )}
    </main>
  );
};
