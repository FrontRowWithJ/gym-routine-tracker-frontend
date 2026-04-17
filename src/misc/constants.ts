export const NOOP = () => {};
export const ORIGIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://machrino.me";


export const DEFAULT_ERROR_MESSAGE = "Server error. Try again later.";

export const OFF = 0;
export const MOUSE_DOWN = 1;
export const DRAGGING = 2;