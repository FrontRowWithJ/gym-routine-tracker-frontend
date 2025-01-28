import "./ErrorBanner.css";
import { Close, Warning } from "@/resources/SVG";
import { createPortal } from "react-dom";
import { Rippleable } from "@/components/Rippleable";
import { Button } from "@/components/Button";
import React, { useState } from "react";

export const useErrorBanner = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const Banner = () =>
    !!errorMessage &&
    createPortal(
      <div className="error-banner">
        <Warning />
        <span>{errorMessage}</span>
        <Rippleable>
          <Button onClick={() => setErrorMessage("")}>
            <Close />
          </Button>
        </Rippleable>
      </div>,
      document.body
    );
  return [Banner, setErrorMessage] as const;
};
