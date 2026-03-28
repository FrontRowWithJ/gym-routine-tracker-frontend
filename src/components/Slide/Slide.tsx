import { SlideProps } from "./types";
import "./Slide.css";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useWindowEvent } from "@/misc/hooks";
import { times, UnitBezier } from "@/misc";

const MAX_DISTANCE_FROM_CENTRE = 160;
const NUM_OF_CELLS = 9;
const NUM_OF_VISIBLE_CELLS = 5;
const HALF_NUM_OF_CELLS = Math.floor(NUM_OF_CELLS / 2);
const HIDDEN_CELLS = NUM_OF_CELLS - NUM_OF_VISIBLE_CELLS;

const unitBezier = new UnitBezier(0.33, 1, 0.68, 1);
const ANIMATION_DURATION = 250;
const OFF = 0;
const MOUSE_DOWN = 1;
const DRAGGING = 2;
const DONE_DRAGGING = 3;

export const Slide = memo(function Slide(props: SlideProps) {
  const { setTime, maxTime, time, className, UIUpdateTrigger } = props;
  const [cellSize, setCellSize] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const begin = useRef(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderPos = useRef<number>(0);
  const requestRef = useRef(0);
  const currMouseY = useRef(0);
  const prevMouseY = useRef(0);
  const startTimestamp = useRef(OFF);
  const canAnimate = useRef<boolean>(false);
  const animateRequestRef = useRef<number>(0);
  const newTimeRef = useRef<number>(time);

  // TODO check if this value is necessary
  const signRef = useRef<number>(1);
  const numOfCellsRef = useRef<number>(1);
  const dragState = useRef<0 | 1 | 2 | 3>(OFF);

  const stopAnimation = useCallback(() => {
    canAnimate.current = false;
    startTimestamp.current = OFF;
    setTranslateY(0);
    setTime({ type: className, newTime: newTimeRef.current });
  }, [className, setTime]);

  const startAnimation = (delta: number) => {
    if (canAnimate.current) {
      stopAnimation();
    }
    // newTimeRef is used because it always has the newest value.
    const newTime = (newTimeRef.current + delta + maxTime) % maxTime;
    // This is to check if the newTime is going to wrap around
    const a = Math.abs(newTime - time) > maxTime >> 1 ? -1 : 1;
    const sign = (time < newTime ? -1 : 1) * a;
    signRef.current = sign;
    newTimeRef.current = newTime;
    numOfCellsRef.current = Math.abs(delta);
    canAnimate.current = true;
  };
  props.startAnimationRef.current = startAnimation;

  const progressAnimation = useCallback(
    (timestamp: DOMHighResTimeStamp) => {
      const t = (timestamp - startTimestamp.current) / ANIMATION_DURATION;
      const progression = unitBezier.solve(t, 0.0001);
      setTranslateY(
        Math.round(
          progression * signRef.current * cellSize * numOfCellsRef.current,
        ),
      );
    },
    [cellSize],
  );

  useLayoutEffect(() => {
    if (!sliderRef.current) return;
    const { y, height } = sliderRef.current.getBoundingClientRect();
    setCellSize(height / NUM_OF_VISIBLE_CELLS);
    sliderPos.current = y;
    setTranslateY(0);
    newTimeRef.current = time;
  }, [UIUpdateTrigger, time]);

  useWindowEvent(
    false,
    "mousemove",
    ({ pageY }) => (currMouseY.current = pageY),
  );

  // TODO try mouseMove event instead of this
  // useEffect(() => {
  //   cancelAnimationFrame(requestRef.current);
  //   const onmousemove = () => {
  //     if (dragState.current !== DRAGGING) {
  //       return (requestRef.current = requestAnimationFrame(onmousemove));
  //     }
  //     const newY = (begin.current + currMouseY.current + cellSize) % cellSize;

  //     if (newY < translateY && currMouseY.current > prevMouseY.current) {
  //       newTimeRef.current = (time + maxTime - 1) % maxTime;
  //       setTime({ type: className, newTime: newTimeRef.current });
  //     }
  //     if (newY > translateY && currMouseY.current < prevMouseY.current) {
  //       newTimeRef.current = (time + 1) % maxTime;
  //       setTime({ type: className, newTime: newTimeRef.current });
  //     }
  //     setTranslateY(newY);
  //     prevMouseY.current = currMouseY.current;
  //     requestRef.current = requestAnimationFrame(onmousemove);
  //   };
  //   requestRef.current = requestAnimationFrame(onmousemove);
  //   return () => cancelAnimationFrame(requestRef.current);
  // }, [maxTime, setTime, time, className, translateY, cellSize]);cd 

  // useEffect that draws the animation
  useEffect(() => {
    cancelAnimationFrame(animateRequestRef.current);
    const drawAnimation = (timestamp: DOMHighResTimeStamp) => {
      if (canAnimate.current) {
        if (startTimestamp.current === OFF) {
          startTimestamp.current = timestamp;
        }
        if (timestamp - startTimestamp.current > ANIMATION_DURATION) {
          stopAnimation();
        } else {
          progressAnimation(timestamp);
        }
      }
      animateRequestRef.current = requestAnimationFrame(drawAnimation);
    };
    animateRequestRef.current = requestAnimationFrame(drawAnimation);
    return () => cancelAnimationFrame(animateRequestRef.current);
  }, [stopAnimation, progressAnimation]);

  return (
    <div
      ref={sliderRef}
      className={`slide ${className} no-select`}
      onMouseDown={({ pageY }) => {
        // If no mouse movement occurs between an
        // onMouseDown & onMouseUp event, it should be considered
        // an onClick event and the onMouseDown should be disregarded
        begin.current = translateY - pageY;
        dragState.current = MOUSE_DOWN;
      }} //TODO implement momentum
      onMouseMove={() => {
        if (dragState.current !== MOUSE_DOWN) return;
        dragState.current = DRAGGING;
      }}
      onWheel={({ deltaY }) => startAnimation(deltaY < 0 ? -1 : 1)}
      onClick={({ clientY }) => {
        // if the mouse moved while the mouse is down (drag event)
        // then the onClick event shouldn't trigger
        if (dragState.current !== OFF) return;
        startAnimation((((clientY - sliderPos.current) / cellSize) | 0) - 2);
      }}
    >
      {times(NUM_OF_CELLS, (i) => {
        const d = Math.abs((HALF_NUM_OF_CELLS - i) * cellSize - translateY);
        return (
          <div
            key={i}
            style={{
              translate: `0 ${translateY - cellSize * (HIDDEN_CELLS / 2)}px`,
              opacity: `${(MAX_DISTANCE_FROM_CENTRE - d) / MAX_DISTANCE_FROM_CENTRE}`,
            }}
          >
            {`${(time + i - HALF_NUM_OF_CELLS + maxTime) % maxTime}`.padStart(2, "0")}
          </div>
        );
      })}
    </div>
  );
});
