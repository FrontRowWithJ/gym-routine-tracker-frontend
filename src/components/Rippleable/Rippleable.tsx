import { RippleProps } from "./types";
import "./Rippleable.css";
import React, { DOMAttributes } from "react";
import { NOOP } from "@/misc";

type onPointerDownFunc = NonNullable<
  DOMAttributes<HTMLElement>["onPointerDown"]
>;
type onPointerUpFunc = NonNullable<DOMAttributes<HTMLElement>["onPointerUp"]>;

const genPointerDownFunc: (
  eventHandler?: onPointerDownFunc
) => onPointerDownFunc = (eventHandler) => {
  return (event) => {
    const target = event.currentTarget;
    const { left, top, width: w, height: h } = target.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    document.documentElement.style.setProperty(
      "--translate",
      `calc(-50% - ${w / 2 - x}px) calc(-50% - ${h / 2 - y}px)`
    );
    target.animate(
      [
        { width: "0%", opacity: 0.12 },
        { width: "250%", opacity: 0.12 },
      ],
      {
        pseudoElement: "::after",
        duration: 210,
        fill: "forwards",
      }
    );
    eventHandler?.(event);
  };
};

const genPointerUpFunc: (eventHandler?: onPointerUpFunc) => onPointerUpFunc = (
  eventHandler
) => {
  return (event) => {
    event.currentTarget.animate([{ opacity: 0.12 }, { opacity: 0 }], {
      pseudoElement: "::after",
      duration: 375,
      fill: "forwards",
    });
    eventHandler?.(event);
  };
};

export const Rippleable = ({ children, disabled }: RippleProps) => {
  return React.Children.map(children, (child: any) => {
    if (React.isValidElement(child)) {
      child = child as any;
      const onPointerUp = disabled
        ? NOOP
        : genPointerUpFunc(child.props["onPointerUp"]);
      const onPointerDown = disabled
        ? NOOP
        : genPointerDownFunc(child.props["onPointerDown"]);
      return React.cloneElement(child, {
        onPointerDown,
        onPointerUp,
        className: `ripple ${child.props["className"]}`,
      });
    }
    return child;
  });
};
