import { InputProps } from "./types";
import "./input.css";
import React from "react";

export const Input = ({
  backgroundColor,
  focusColor,
  className,
  placeholder,
  errorMessage = "",
  type,
  ...inputProps
}: InputProps) => {
  const { maxLength } = inputProps;
  const inputWrapperSuffix = type === "pattern" ? "--pattern" : "--default";
  return (
    <div className="input">
      <div
        className={`input-wrapper${inputWrapperSuffix} ${className ?? ""}`}
        onClick={() => inputProps.ref?.current?.focus()}
      >
        {type === "pattern" && <span className="pattern">youtube.com/watch?=</span>}
        <input {...inputProps} type={type === "pattern" ? "text" : type} />
        <span style={{ backgroundColor }} className="input-placeholder">
          {`${placeholder}`}
          {inputProps.required && <span className="required">*</span>}
        </span>
      </div>
      <span className="error-message">
        {errorMessage}
        {maxLength !== undefined && (
          <span className="input-counter">{`${
            ("" + inputProps.value).length
          } / ${maxLength}`}</span>
        )}
      </span>
    </div>
  );
};
