import { SlideProps } from "./types";
import "./Slide.css";
import { memo, useCallback, useEffect, useRef } from "react";
import { useWindowEvent } from "@/misc/hooks";
import { times, UnitBezier, OFF, MOUSE_DOWN, DRAGGING } from "@/misc";

const NUM_OF_VISIBLE_CELLS = 5;
const ANIMATION_DURATION = 250;
const FLING_ANIMATION_DURATION = 500;
const FRICTION = 0.93; // velocity decay per frame
const FLING_THRESHOLD = 0.3; // px/ms — below this, just snap

const DIRECTION_MAP = {
  ArrowDown: 1,
  ArrowUp: -1,
  W: 1,
  w: 1,
  s: -1,
  S: -1,
} as const;

const unitBezier = new UnitBezier(0.22, 1, 0.36, 1);

export const Slide = memo(function Slide(props: SlideProps) {
  const { setTime, maxTime, time, type, UIUpdateTrigger, isSelected } = props;
  // animation
  const translateYRef = useRef(0);
  const targetYRef = useRef(0);
  const startYRef = useRef(0);
  const startTimestampRef = useRef(OFF);
  const animateRequestRef = useRef(0);
  const canAnimateRef = useRef(false);
  const flingRef = useRef(false);

  // cells
  const sliderRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<HTMLDivElement[]>([]);
  const cellSizeRef = useRef(0);
  const selectedIndexRef = useRef(time + maxTime / 2);
  const lastTimestampRef = useRef(0);

  // drag
  const dragStateRef = useRef<0 | 1 | 2>(OFF);
  const dragStartYRef = useRef(0);
  const dragStartTranslateYRef = useRef(0);
  const maxTranslateYRef = useRef(0);
  const minTranslateYRef = useRef(0);
  const velocityRef = useRef(0);
  const lastDragYRef = useRef(0);
  const lastDragTimeRef = useRef(0);

  const getTranslateY = useCallback((selectedIndex: number) => {
    const { current: cellSize } = cellSizeRef;
    const height = cellSize * NUM_OF_VISIBLE_CELLS;
    return -(selectedIndex * cellSize) - cellSize / 2 + height / 2;
  }, []);

  const applyTranslateY = useCallback((value: number) => {
    const centreY = (cellSizeRef.current * NUM_OF_VISIBLE_CELLS) / 2;
    const selectedIndex =
      (-value + centreY - cellSizeRef.current / 2) / cellSizeRef.current;

    cellsRef.current.forEach((el, i) => {
      const d = Math.abs(i - selectedIndex);
      el.style.transform = `translateY(${value}px)`;
      // opacity is set here because it needs to be applied every time style.transform changes
      el.style.opacity = `${Math.max(0, 1 - d / (NUM_OF_VISIBLE_CELLS / 2))}`;
    });
  }, []);

  const startAnimation = useCallback(
    (delta: number) => {
      canAnimateRef.current = true;
      const prevIndex = selectedIndexRef.current;
      // positive value within [maxTime * 0.5, maxTime * 1.5)
      selectedIndexRef.current =
        maxTime / 2 +
        ((selectedIndexRef.current + delta + maxTime / 2) % maxTime);

      if (prevIndex - selectedIndexRef.current > maxTime / 2) {
        translateYRef.current += maxTime * cellSizeRef.current;
        applyTranslateY(translateYRef.current);
      } else if (selectedIndexRef.current - prevIndex > maxTime / 2) {
        translateYRef.current -= maxTime * cellSizeRef.current;
        applyTranslateY(translateYRef.current);
      }
      startTimestampRef.current = lastTimestampRef.current;
      startYRef.current = translateYRef.current;
      targetYRef.current = getTranslateY(selectedIndexRef.current);
    },
    [applyTranslateY, getTranslateY, maxTime],
  );

  const handleDragMove: React.PointerEventHandler<HTMLDivElement> = useCallback(
    ({ pageY }) => {
      if (dragStateRef.current === OFF) return;
      dragStateRef.current = DRAGGING;

      const now = performance.now();
      const dt = now - lastDragTimeRef.current;
      if (dt > 0) {
        velocityRef.current = (pageY - lastDragYRef.current) / dt; // px/ms
      }
      lastDragYRef.current = pageY;
      lastDragTimeRef.current = now;

      translateYRef.current =
        dragStartTranslateYRef.current + (pageY - dragStartYRef.current);
      // wrap detection
      if (translateYRef.current > maxTranslateYRef.current) {
        translateYRef.current -= maxTime * cellSizeRef.current;
        dragStartTranslateYRef.current -= maxTime * cellSizeRef.current;
      } else if (translateYRef.current < minTranslateYRef.current) {
        translateYRef.current += maxTime * cellSizeRef.current;
        dragStartTranslateYRef.current += maxTime * cellSizeRef.current;
      }
      selectedIndexRef.current =
        ((Math.floor(
          (-translateYRef.current -
            (cellSizeRef.current * maxTime) / 2 +
            (cellSizeRef.current * NUM_OF_VISIBLE_CELLS) / 2) /
            cellSizeRef.current,
        ) +
          maxTime) %
          maxTime) +
        maxTime / 2;
      applyTranslateY(translateYRef.current);
    },
    [applyTranslateY, maxTime],
  );

  const handleDragEnd: React.PointerEventHandler<HTMLDivElement> =
    useCallback(() => {
      // pointerup only matters when dragging has occurred
      // without drag, pointerdown→pointerup is handled as onClick
      if (dragStateRef.current !== DRAGGING) return;

      const vel = velocityRef.current;

      if (Math.abs(vel) > FLING_THRESHOLD) {
        // Project where the scroll will coast to
        // Sum of geometric series: totalDelta = vel * (1/(1-friction))
        const totalDelta = vel * (1 / (1 - FRICTION)) * 16; // ~16ms per frame
        const projectedY = translateYRef.current + totalDelta;

        // Find the nearest snap index from projected position
        const centreY = (cellSizeRef.current * NUM_OF_VISIBLE_CELLS) / 2;
        const rawIndex =
          (-projectedY + centreY - cellSizeRef.current / 2) /
          cellSizeRef.current;
        const snappedIndex =
          maxTime / 2 + ((Math.round(rawIndex) + maxTime / 2) % maxTime);

        selectedIndexRef.current = snappedIndex;
        flingRef.current = true;
      }

      targetYRef.current = getTranslateY(selectedIndexRef.current);
      startYRef.current = translateYRef.current;
      startTimestampRef.current = lastTimestampRef.current;
      canAnimateRef.current = true;
      dragStateRef.current = OFF;
      velocityRef.current = 0;
    }, [getTranslateY, maxTime]);

  const handleOnWheel: React.WheelEventHandler<HTMLDivElement> = useCallback(
    ({ deltaY }) => startAnimation(deltaY < 0 ? -1 : 1),
    [startAnimation],
  );

  const handleOnPointerDown: React.PointerEventHandler<HTMLDivElement> = ({
    pageY,
    pointerId,
    currentTarget,
  }) => {
    // if no movement occurs between pointerdown→pointerup, it's handled as onClick
    if (dragStateRef.current !== OFF) return;
    currentTarget.setPointerCapture(pointerId);
    canAnimateRef.current = false;
    flingRef.current = false;
    dragStateRef.current = MOUSE_DOWN;
    dragStartYRef.current = pageY;
    dragStartTranslateYRef.current = translateYRef.current;
    lastDragYRef.current = pageY;
    lastDragTimeRef.current = performance.now();
  };

  const handleOnClick: React.MouseEventHandler<HTMLDivElement> = useCallback(
    ({ clientY }) => {
      if (dragStateRef.current !== MOUSE_DOWN || !sliderRef.current) return;
      const { y } = sliderRef.current.getBoundingClientRect();
      dragStateRef.current = OFF;
      startAnimation((((clientY - y) / cellSizeRef.current) | 0) - 2);
    },
    [startAnimation],
  );

  useEffect(() => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;

    // Measure cell size
    const { height } = container.getBoundingClientRect();
    cellSizeRef.current = height / NUM_OF_VISIBLE_CELLS;
    const cellSize = cellSizeRef.current;

    // Position initial selected cell at centre
    translateYRef.current =
      -(selectedIndexRef.current * cellSize) - cellSize / 2 + height / 2;

    maxTranslateYRef.current = getTranslateY(maxTime / 2);
    minTranslateYRef.current = getTranslateY(maxTime * 1.5);

    // Create cells
    const cells = times(maxTime * 2, (i) => {
      const el = document.createElement("div");
      el.textContent = `${(i + maxTime / 2) % maxTime}`.padStart(2, "0");
      container.appendChild(el);
      return el;
    });
    cellsRef.current = cells;
    applyTranslateY(translateYRef.current);
    return () => {
      container.replaceChildren();
      cellsRef.current = [];
    };
  }, [maxTime, applyTranslateY, getTranslateY]);

  useEffect(() => {
    selectedIndexRef.current = maxTime / 2 + time;
    translateYRef.current = getTranslateY(selectedIndexRef.current);
    applyTranslateY(translateYRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [UIUpdateTrigger]);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    const preventDefault = (e: TouchEvent) => e.preventDefault();
    container.addEventListener("touchmove", preventDefault, { passive: false });

    return () => container.removeEventListener("touchmove", preventDefault);
  }, []);

  useEffect(() => {
    const drawAnimation = (timestamp: DOMHighResTimeStamp) => {
      lastTimestampRef.current = timestamp;
      if (canAnimateRef.current) {
        // if this is a new animation then let's reset the timer
        if (startTimestampRef.current === OFF) {
          startTimestampRef.current = timestamp;
        }
        const duration = flingRef.current
          ? FLING_ANIMATION_DURATION
          : ANIMATION_DURATION;
        const t = (timestamp - startTimestampRef.current) / duration;
        if (t >= 1) {
          // Animation complete, snap to target
          flingRef.current = false;
          translateYRef.current = targetYRef.current;
          canAnimateRef.current = false;
          startTimestampRef.current = OFF;
          setTime({ type, newTime: selectedIndexRef.current - maxTime / 2 });
        } else {
          const progression = unitBezier.solve(t, 0.0001);
          translateYRef.current = Math.round(
            startYRef.current +
              progression * (targetYRef.current - startYRef.current),
          );
        }
        // Apply to all cells
        applyTranslateY(translateYRef.current);
      }
      animateRequestRef.current = requestAnimationFrame(drawAnimation);
    };
    animateRequestRef.current = requestAnimationFrame(drawAnimation);
    return () => cancelAnimationFrame(animateRequestRef.current);
  }, [applyTranslateY, setTime, type, maxTime]);

  useWindowEvent(
    "keydown",
    ({ key }) => {
      if (!(key in DIRECTION_MAP) || !isSelected) return;
      const sign = DIRECTION_MAP[key as keyof typeof DIRECTION_MAP];
      startAnimation(sign);
    },
    [isSelected, startAnimation],
  );

  return (
    <div
      ref={sliderRef}
      className={`slide ${type} no-select`}
      onPointerDown={handleOnPointerDown}
      onPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onWheel={handleOnWheel}
      onClick={handleOnClick}
    />
  );
});
