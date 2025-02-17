import { memo, ReactNode } from "react";
import { hashString } from "@/misc";

type DottedPatternProps = {
  name: string;
};

const CIRCLE = 0,
  STYLE_A = 0;
const RADIUS = 16;
const WIDTH = 1024;

export const genComponents = (value: string) => {
  const bytes = hashString(value);
  return {
    colorIdx: bytes[0] & 0b1111,
    shape: bytes[1] & 0b1,
    style: bytes[2] & 0b1,
    strokeWidth: bytes[3] & 0b11,
    dotsPerRow: (bytes[4] & 0b111) + 6,
    saturation: (bytes[5] & 0b1) + 1,
  };
};

export const DottedPattern = memo((props: DottedPatternProps) => {
  const { colorIdx, shape, style, strokeWidth, dotsPerRow, saturation } =
    genComponents(props.name);
  const color = `hsl(${(colorIdx / 16) * 360} ${50 * saturation}% 50%)`;
  const genStyleA = () =>
    Math.random() < 0.5
      ? { fill: color, opacity: 1 }
      : { fill: color, opacity: 0.5 };
  const genStyleB = () =>
    Math.random() < 0.5 ? { fill: color } : { stroke: color };
  const genStyle = style === STYLE_A ? genStyleA : genStyleB;
  const genCircle = (i: number, x: number, y: number) => (
    <circle
      key={i}
      r={RADIUS}
      cx={(x / dotsPerRow) * WIDTH}
      cy={(y / dotsPerRow) * WIDTH}
      {...genStyle()}
    />
  );
  const genRect = (i: number, x: number, y: number) => (
    <rect
      key={i}
      x={(x / dotsPerRow) * WIDTH - RADIUS}
      y={(y / dotsPerRow) * WIDTH - RADIUS}
      width={RADIUS * 2}
      height={RADIUS * 2}
      {...genStyle()}
      transform={`rotate(45 ${(x / dotsPerRow) * WIDTH} ${
        (y / dotsPerRow) * WIDTH - RADIUS
      })`}
    />
  );
  const genShape = shape === CIRCLE ? genCircle : genRect;
  const shapes: ReactNode[] = [];
  for (let i = 0; i < dotsPerRow * dotsPerRow; i++)
    shapes.push(genShape(i, i % dotsPerRow, (i / dotsPerRow) | 0));
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox={`0 0 ${WIDTH} ${WIDTH}`}
    >
      <g strokeWidth={strokeWidth} fill="none" stroke="none">
        {shapes}
      </g>
    </svg>
  );
});
