import { useState } from "react";
import { EditPage } from "./EditPage";
import { WorkoutProps } from "./types";
import "./Workout.css";

export const Workout = ({
  workoutName,
  repCount,
  setCount,
  unit,
  unitAmount,
  tutorialLink,
  amount,
  increment,
  decrement,
  remove,
  update,
  routineID,
}: WorkoutProps) => {
  const [canEdit, setEdit] = useState(false);
  return (
    <article className="workout-card">
      <h3>{workoutName}</h3>
      <button>Tutoral</button>
      <div className="weight-toggle-container">
        <section>
          <button onClick={increment}>+</button>
          <div>{`${amount} ${unit}`}</div>
          <button onClick={decrement}>-</button>
        </section>
        <section>
          <button onClick={remove}>Delete</button>
          <div>
            <span>{`${repCount} reps`}</span>
            <span>{`${setCount} sets`}</span>
          </div>
          <button onClick={() => setEdit(true)}>Edit</button>
          {canEdit && (
            <EditPage
              {...{
                routineID,
                workoutName,
                setCount,
                repCount,
                unit,
                unitAmount,
                tutorialLink,
                amount,
                update,
              }}
              disable={() => setEdit(false)}
            />
          )}
        </section>
      </div>
    </article>
  );
};
