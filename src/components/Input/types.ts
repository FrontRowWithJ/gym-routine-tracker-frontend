type HTMLInput = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;
export interface InputProps extends HTMLInput {
  backgroundColor: string;
  focusColor: string;
  value: string | number;
  errorMessage?: string;
  type?: HTMLInput["type"] | "pattern";
  ref?: React.RefObject<HTMLInputElement>;
}
