import { ReducerAction, Timestamp } from "./types";
import "./Timer.css";
import { useEffect, useReducer, useRef, useState } from "react";
import { useWindowEvent } from "@/misc/hooks";
import { Slide } from "@/components/Slide";
import { Button } from "@/components/Button";
import { PlayButton } from "@/resources/SVG";
import {
  SECONDS_PER_HOUR,
  TimerDisplay,
  SECONDS_PER_MINUTE,
} from "@/components/TimerDisplay";
import { SavedTimestamps } from "@/components/SavedTimestamps";
import { times } from "@/misc";

const DIRECTION_MAP = {
  ArrowDown: 1,
  ArrowUp: -1,
  W: 1,
  w: 1,
  s: -1,
  S: -1,
} as const;

const SETTING_CHANGER = {
  ArrowLeft: -1,
  ArrowRight: 1,
  A: -1,
  a: -1,
  D: 1,
  d: 1,
} as const;
const setting = [SECONDS_PER_HOUR, SECONDS_PER_MINUTE, 1];

export const TestTimer = () => {
  const [translateY, setTranslateY] = useState(0);
  const isMouseDown = useRef(false);
  const begin = useRef<number>(0);
  const [currValue, setCurrValue] = useState(0);
  const length = 5;
  const prevPageY = useRef(0);

  useWindowEvent(false, "mouseup", () => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
  });

  useWindowEvent(
    false,
    "mousemove",
    ({ pageY }) => {
      if (!isMouseDown.current) return;
      const newY = (begin.current + pageY) % 40;
      if (newY < translateY && pageY > prevPageY.current) {
        setCurrValue((currValue) => (currValue + (length - 1)) % length);
      } else if (newY > translateY && pageY < prevPageY.current) {
        setCurrValue((currValue) => (currValue + 1) % length);
      }
      setTranslateY(newY);
      prevPageY.current = pageY;
    },
    [translateY, currValue],
  );

  return (
    <div
      className="test no-select"
      onMouseDown={({ pageY }) => {
        begin.current = translateY - pageY;
        isMouseDown.current = true;
        prevPageY.current = pageY;
      }}
    >
      {times(length + 2, (i) => {
        return (
          <div
            key={i}
            className="item"
            style={{ translate: `0 ${translateY - 40}px` }}
          >
            {((currValue + i - 1 + length) % length) + 1}
          </div>
        );
      })}
    </div>
  );
};

const reducer = (state: Timestamp, action: ReducerAction): Timestamp => {
  if (action.type === "all") return action.timestamp;
  return { ...state, [action.type]: action.newTime };
};

export const Timer = () => {
  const isMouseDown = useRef(false);
  useWindowEvent(false, "mouseup", () => (isMouseDown.current = false));
  const init: Timestamp = localStorage.getItem("time")
    ? JSON.parse(localStorage.getItem("time")!)
    : { hour: 0, minute: 0, second: 0 };
  const [{ hour, minute, second }, setTime] = useReducer(reducer, init);
  const [timer, setTimer] = useState<"active" | "inactive">("inactive");
  const [UIUpdateTrigger, setUIUpdateTrigger] = useState({});
  const startSecondAnimationRef = useRef<(delta: number) => void>(undefined);
  const startMinuteAnimationRef = useRef<(delta: number) => void>(undefined);
  const startHourAnimationRef = useRef<(delta: number) => void>(undefined);
  const indexRef = useRef<number>(0);
  useEffect(() => {
    localStorage.setItem("time", JSON.stringify({ hour, minute, second }));
  }, [hour, minute, second]);

  useWindowEvent(
    false,
    "keydown",
    ({ key }) => {
      if (!(key in DIRECTION_MAP) && !(key in SETTING_CHANGER)) return;
      if (key in SETTING_CHANGER) {
        indexRef.current +=
          SETTING_CHANGER[key as keyof typeof SETTING_CHANGER];
        if (indexRef.current < 0) indexRef.current = 0;
        if (indexRef.current > 2) indexRef.current = 2;
        return;
      }
      const sign = DIRECTION_MAP[key as keyof typeof DIRECTION_MAP];
      let totalSeconds =
        hour * SECONDS_PER_HOUR +
        minute * SECONDS_PER_MINUTE +
        second +
        setting[indexRef.current] * sign;
      totalSeconds = Math.max(totalSeconds, 0);
      const newSeconds = totalSeconds % 60;
      totalSeconds = (totalSeconds - newSeconds) / 60;
      const newMinutes = totalSeconds % 60;
      totalSeconds = (totalSeconds - newMinutes) / 60;
      const newHours = totalSeconds;
      startSecondAnimationRef.current?.(newSeconds - second);
      startMinuteAnimationRef.current?.(newMinutes - minute);
      startHourAnimationRef.current?.(newHours - hour);
    },
    [hour, minute, second],
  );

  return (
    <div className="timer">
      {timer === "inactive" ? (
        <>
          <div className="slider">
            <Slide
              className="hour"
              time={hour}
              maxTime={24}
              setTime={setTime}
              UIUpdateTrigger={UIUpdateTrigger}
              startAnimationRef={startHourAnimationRef}
            />
            <span>:</span>
            <Slide
              className="minute"
              time={minute}
              maxTime={60}
              setTime={setTime}
              UIUpdateTrigger={UIUpdateTrigger}
              startAnimationRef={startMinuteAnimationRef}
            />
            <span>:</span>
            <Slide
              className="second"
              time={second}
              maxTime={60}
              setTime={setTime}
              UIUpdateTrigger={UIUpdateTrigger}
              startAnimationRef={startSecondAnimationRef}
            />
          </div>
          <SavedTimestamps
            time={{ hour, minute, second }}
            setTime={(action: ReducerAction) => {
              setTime(action);
              setUIUpdateTrigger({});
            }}
          />
          <Button
            className="start-timer-button"
            disabled={second === 0 && minute === 0 && hour === 0}
            onClick={() => {
              const s = localStorage.getItem("timestamps");
              const timestamps: Timestamp[] = s ? JSON.parse(s) : [];
              const idx = timestamps.findIndex(
                ({ hour: h, minute: m, second: s }) =>
                  hour === h && minute === m && second === s,
              );
              if (idx === -1) {
                timestamps.unshift({ hour, minute, second });
                if (timestamps.length > 10) {
                  timestamps.pop();
                }
              } else {
                const timestamp = timestamps.splice(idx, 1);
                timestamps.unshift(timestamp[0]);
              }
              localStorage.setItem("timestamps", JSON.stringify(timestamps));
              setTimer("active");
            }}
          >
            <PlayButton />
          </Button>
        </>
      ) : (
        <TimerDisplay
          hour={hour}
          minute={minute}
          second={second}
          stopTimer={() => setTimer("inactive")}
        />
      )}
    </div>
  );
};
