export type RadioGroupProps<T extends string[]> = {
  values: T;
  name: string;
  onChange: (value: T[number]) => void;
  value: T[number];
};
