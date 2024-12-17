import { CSSProperties } from "react";

export type DividerProps = {
  width?: string;
  margin?: string;
  vertical?: boolean;
  backgroundColor?: CSSProperties["backgroundColor"];
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
