import { EditPageProps } from "./types";
import { Plus, Minus } from "../../../../resources/SVG";
import "./EditPage.css";
import { useRef, useState, CSSProperties } from "react";

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const START_STYLE: CSSProperties = { left: 0, transform: "translateX(0%)" };

const END_STYLE: CSSProperties = {
  left: "100%",
  transform: "translateX(calc(-100% - 6px))",
};

const ENABLED: CSSProperties = { opacity: 1, cursor: "" };

const DISABLED: CSSProperties = { opacity: 0.5, cursor: "not-allowed" };

export const EditPage = ({
  disable,
  update,
  ...workoutData
}: EditPageProps) => {
  const workoutNameRef = useRef<HTMLInputElement>(null);
  const setCountRef = useRef<HTMLInputElement>(null);
  const repCountRef = useRef<HTMLInputElement>(null);
  const unitAmountRef = useRef<HTMLInputElement>(null);
  const tutorialLinkRef = useRef<HTMLInputElement>(null);
  const [workoutName, setWorkoutName] = useState<string>(
    workoutData.workoutName
  );
  const [setCount, setSetCount] = useState(workoutData.setCount);
  const [repCount, setRepCount] = useState(workoutData.repCount);
  const [unit, setUnit] = useState<"" | "mins" | "kg" | "s">(workoutData.unit);
  const [unitAmount, setUnitAmount] = useState(workoutData.unitAmount);
  const [tutorialLink, setTutorialLink] = useState<string>(
    workoutData.tutorialLink
  );
  const [amount, setAmount] = useState(workoutData.amount);
  const [hasTutorial, setHasTutorial] = useState(!!workoutData.tutorialLink);
  return (
    <div className="edit-page-modal">
      <form action="" autoComplete="off">
        <header>
          <div className="back-button" onClick={disable}>
            Back
          </div>
        </header>
        <label htmlFor="workout-name">Workout Name</label>
        <div>
          <input
            ref={workoutNameRef}
            value={workoutName}
            onChange={({ target: { value } }) => setWorkoutName(value)}
            required
            inputMode="text"
            lang="en"
            pattern="^[a-zA-Z0-9]{3,}[a-zA-Z0-9 ]*$"
            title="Please enter a valid workout name"
            type="text"
            name="workout-name"
          />
        </div>

        <label htmlFor="number-of-sets">Number of Sets</label>
        <div>
          <input
            ref={setCountRef}
            value={setCount}
            onChange={({ target: { value } }) =>
              setSetCount((curr) => (isNaN(+value) ? curr : +value))
            }
            required
            inputMode="numeric"
            lang="en"
            pattern="^[1-9]\d*$"
            title="Please enter a valid number of sets"
            type="text"
            name="number-of-sets"
          />
        </div>

        <div>
          <label htmlFor="number-of-reps">Number of Reps per Set</label>
          <div>
            <input
              ref={repCountRef}
              value={repCount}
              onChange={({ target: { value } }) =>
                setRepCount((curr) => (isNaN(+value) ? curr : +value))
              }
              required
              inputMode="numeric"
              lang="en"
              pattern="^[1-9]\d*$"
              title="Please enter a valid number of reps"
              type="text"
              name="number-of-reps"
            />
          </div>
        </div>

        <fieldset className="radio-button-fieldset">
          <legend>Select a Unit:</legend>
          {(["", "kg", "s", "mins"] as const).map((_unit) => (
            <div key={_unit}>
              <div
                className="radio-button"
                style={{
                  backgroundColor:
                    unit === _unit ? "rgba(29, 180, 150, 1)" : "white",
                }}
                id={_unit}
                onClick={() => setUnit(_unit)}
              ></div>
              <label
                htmlFor={_unit}
                style={{
                  color: unit === _unit ? "rgba(29, 180, 150, .8)" : "",
                }}
              >
                {capitalise(_unit) || "None"}
              </label>
            </div>
          ))}
        </fieldset>

        <label htmlFor="unit-amount">Unit Amount</label>
        <div>
          <input
            ref={unitAmountRef}
            value={unitAmount}
            onChange={({ target: { value } }) => {
              setUnitAmount((curr) => (isNaN(+value) ? curr : +value));
              setAmount(0);
            }}
            required
            inputMode="numeric"
            lang="en"
            pattern="^[1-9]\d*$"
            title="Please enter a valid unit amount"
            type="text"
            name="unit-amount"
          />
        </div>

        <label htmlFor="amount">Workout Amount</label>
        <div className="amount-wrapper">
          <div>
            <button
              type="button"
              onClick={() => setAmount((curr) => curr + unitAmount)}
            >
              <Plus fill="white" />
            </button>
          </div>
          <span>{amount}</span>
          <div>
            <button
              type="button"
              onClick={() =>
                setAmount((curr) => Math.max(0, curr - unitAmount))
              }
            >
              <Minus fill="white" />
            </button>
          </div>
        </div>

        <fieldset className="checkbox-fieldset">
          <div
            className="checkbox"
            style={{
              backgroundColor: hasTutorial ? "rgba(29, 180, 150, 1)" : "",
            }}
            onClick={() => setHasTutorial((hasTutorial) => !hasTutorial)}
          >
            <div
              className="switch"
              style={hasTutorial ? END_STYLE : START_STYLE}
            ></div>
          </div>
          <span className="checkbox-text">Has Video Tutorial?</span>
        </fieldset>

        <div>
          <label
            htmlFor="tutorial-url"
            style={hasTutorial ? ENABLED : DISABLED}
          >
            Youtube URL
          </label>
          <div style={hasTutorial ? ENABLED : DISABLED}>
            <input
              ref={tutorialLinkRef}
              className="tutorial-url"
              value={tutorialLink}
              onChange={({ target: { value } }) => setTutorialLink(value)}
              inputMode="url"
              lang="en"
              pattern="https://www.youtube.com/embed/[a-zA-Z0-9]+"
              title="Please enter a valid youtube url"
              required={hasTutorial}
              disabled={!hasTutorial}
              type="text"
              name="tutorial-url"
            />
          </div>
        </div>

        <button
          type="submit"
          onClick={(evt) => {
            evt.preventDefault();
            if (!workoutNameRef.current?.checkValidity())
              return workoutNameRef.current?.reportValidity();
            if (!setCountRef.current?.checkValidity())
              return setCountRef.current?.reportValidity();
            if (!repCountRef.current?.checkValidity())
              return repCountRef.current?.reportValidity();
            if (!unitAmountRef.current?.checkValidity())
              return unitAmountRef.current?.reportValidity();
            if (!tutorialLinkRef.current?.checkValidity())
              return tutorialLinkRef.current?.reportValidity();

            update({
              workoutID: -1,
              routineID: workoutData.routineID,
              workoutName,
              setCount,
              repCount,
              unit,
              unitAmount,
              tutorialLink: tutorialLink as
                | `https://www.youtube.com/embed/${string}`
                | "",
              amount: 0,
            });
            disable();
          }}
        >
          Save
        </button>
      </form>
    </div>
  );
};
