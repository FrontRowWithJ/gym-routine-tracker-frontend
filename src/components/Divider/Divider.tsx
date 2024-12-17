import { DividerProps } from "./types";
import "./Divider.css";

export const Divider = ({
  className,
  style,
  margin = "0",
  width,
  vertical,
  backgroundColor,
  ...divProps
}: DividerProps) => {
  margin = vertical ? `auto ${margin}` : `${margin} auto`;
  return (
    <div
      className={`divider ${vertical ? "vertical" : "horizontal"} ${
        className ?? ""
      }`}
      style={{
        ...style,
        margin,
        [vertical ? "height" : "width"]: width,
        backgroundColor,
      }}
      {...divProps}
    ></div>
  );
};
