import { ButtonProps } from "./types";
import "./Button.css";
import { Rippleable } from "@/components/Rippleable";
import { NOOP } from "@/misc";

export const Button = (props: ButtonProps) => {
  return (
    <Rippleable disabled={props.disabled}>
      <button
        {...{
          ...props,
          onClick: props.disabled ? NOOP : props.onClick,
          className: `ui-button ${props.className ?? ""} ${props.disabled ? "ui-disabled" : ""}`,
        }}
      >
        {props.children}
      </button>
    </Rippleable>
  );
};
