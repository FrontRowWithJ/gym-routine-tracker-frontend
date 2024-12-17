import { SVGProp } from "./SVGTypes";

export type RoutineIconProps = {
  fill: string;
  stopColor0: string;
  stopColor1: string;
  stopColor2: string;
  angle: number;
  hash: string;
} & SVGProp;

export const RoutineIcon = (props: RoutineIconProps) => (
  <svg
    viewBox="0 0 700 700"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    className={props.className}
  >
    <defs>
      <linearGradient
        gradientTransform={`rotate(${-props.angle}, 0.5, 0.5)`}
        x1="50%"
        y1="0%"
        x2="50%"
        y2="100%"
        id={`${props.hash}-0`}
      >
        <stop stopColor={props.stopColor0} stopOpacity="0" offset="0%" />
        <stop stopColor={props.stopColor1} stopOpacity="1" offset="100%" />
      </linearGradient>
      <linearGradient
        gradientTransform={`rotate(${props.angle}, 0.5, 0.5)`}
        x1="50%"
        y1="0%"
        x2="50%"
        y2="100%"
        id={`${props.hash}-1`}
      >
        <stop stopColor={props.stopColor2} stopOpacity="1" offset="0%" />
        <stop stopColor={props.stopColor1} stopOpacity="0" offset="100%" />
      </linearGradient>
    </defs>
    <g>
      <rect width="100%" height="100%" fill={props.fill}></rect>
      <rect width="100%" height="100%" fill={`url(#${props.hash}-0)`}></rect>
      <rect width="100%" height="100%" fill={`url(#${props.hash}-1)`}></rect>
    </g>
  </svg>
);
