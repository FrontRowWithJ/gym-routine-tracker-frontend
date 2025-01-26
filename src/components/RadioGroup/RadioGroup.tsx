import { RadioGroupProps } from "./types";
import "./RadioGroup.css";
import { Rippleable } from "@/components/Rippleable";
import { Fragment } from "react";
import { NOOP } from "@/misc";
import { Divider } from "@/components/Divider";

export function RadioGroup<const T extends string[]>({
  values,
  name,
  value: currValue,
  onChange,
}: RadioGroupProps<T>) {
  return (
    <fieldset className="radio-group">
      <legend>{name}</legend>
      {values.map((value, i) => {
        return (
          <Fragment key={value}>
            <div>
              <Rippleable>
                <div onClick={() => onChange(value)}>
                  <input
                    type="radio"
                    name={name}
                    value={value}
                    checked={currValue === value}
                    onChange={NOOP}
                  />
                </div>
              </Rippleable>
              <label htmlFor={value}>{value}</label>
            </div>
            {i < values.length - 1 && (
              <Divider style={{ opacity: 0.3 }} vertical margin="1px" />
            )}
          </Fragment>
        );
      })}
    </fieldset>
  );
}
