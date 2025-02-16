import { CounterProps } from "./types";
import "./Counter.css";
import { Button } from "@/components/Button";
import { Add, Minus } from "@/resources/SVG";

export const Counter = (props: CounterProps) => {
  return (
    <div className="counter">
      <label>{props.placeholder}</label>
      <div>
        <Button type="button" onClick={props.increment}>
          <Add />
        </Button>
        <span>{props.value}</span>
        <Button type="button" onClick={props.decrement}>
          <Minus />
        </Button>
        <fieldset>
          <legend>
            <span>{props.placeholder}</span>
          </legend>
        </fieldset>
      </div>
    </div>
  );
};
