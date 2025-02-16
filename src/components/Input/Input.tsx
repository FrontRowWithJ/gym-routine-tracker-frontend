import { InputProps } from "./types";
import "./input.css";
import React, { useRef } from "react";

export const Input = ({
  className,
  placeholder,
  ...inputProps
}: InputProps) => {
  const { maxLength } = inputProps;
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={`input ${className ?? ""}`}>
      <label>{placeholder}</label>
      <div>
        <input ref={inputRef} {...inputProps} />
        <fieldset>
          <legend>
            <span>{placeholder}</span>
          </legend>
        </fieldset>
      </div>
      <p>
        {inputRef.current?.validationMessage ?? ""}
        {maxLength !== undefined && (
          <span>{`${("" + inputProps.value).length} / ${maxLength}`}</span>
        )}
      </p>
    </div>
  );
};
