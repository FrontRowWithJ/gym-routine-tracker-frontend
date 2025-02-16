type HTMLInput = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;
export interface InputProps extends HTMLInput {
  value: string | number;
  ref?: React.RefObject<HTMLInputElement>;
}
