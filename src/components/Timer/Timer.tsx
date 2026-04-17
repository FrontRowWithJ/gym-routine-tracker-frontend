import { ReducerAction, Timestamp } from "./types";
import "./Timer.css";
import { useEffect, useReducer, useState } from "react";
import { useWindowEvent } from "@/misc/hooks";
import { Slide } from "@/components/Slide";
import { Button } from "@/components/Button";
import { PlayArrow } from "@/resources/SVG";
import {
  HOURS_PER_DAY,
  MINUTES_PER_HOUR,
  SECONDS_PER_MINUTE,
  TimerDisplay,
} from "@/components/TimerDisplay";
import { SavedTimestamps } from "@/components/SavedTimestamps";

const SLIDER_MAP = {
  ArrowLeft: -1,
  ArrowRight: 1,
  A: -1,
  a: -1,
  D: 1,
  d: 1,
} as const;

const [HOUR, MINUTE, SECOND] = [0, 1, 2] as const;
const NUM_OF_SLIDERS = 3;

const reducer = (state: Timestamp, action: ReducerAction): Timestamp => {
  if (action.type === "all") return action.timestamp;
  return { ...state, [action.type]: action.newTime };
};

const upsertTimestamp = (timestamp: Timestamp): Timestamp[] => {
  const s = localStorage.getItem("timestamps");
  const timestamps: Timestamp[] = s ? JSON.parse(s) : [];
  const idx = timestamps.findIndex(
    ({ hour: h, minute: m, second: sec }) =>
      timestamp.hour === h &&
      timestamp.minute === m &&
      timestamp.second === sec,
  );
  if (idx !== -1) timestamps.splice(idx, 1);
  timestamps.unshift(timestamp);
  if (timestamps.length > 10) timestamps.pop();
  return timestamps;
};

export const Timer = () => {
  const [{ hour, minute, second }, setTime] = useReducer(
    reducer,
    undefined,
    () => {
      const s = localStorage.getItem("time");
      return s ? JSON.parse(s) : { hour: 0, minute: 0, second: 0 };
    },
  );
  const [timer, setTimer] = useState<"active" | "inactive">("inactive");
  const [UIUpdateTrigger, setUIUpdateTrigger] = useState({});

  const [sliderIndex, setSliderIndex] = useState<number>(HOUR);

  useWindowEvent(
    "keydown",
    ({ key }) => {
      if (key === "Enter" && timer !== "active") {
        setTimer("active");
        return;
      }
      if (!(key in SLIDER_MAP)) return;
      const sign = SLIDER_MAP[key as keyof typeof SLIDER_MAP];
      setSliderIndex((curr) => (curr + sign + NUM_OF_SLIDERS) % NUM_OF_SLIDERS);
    },
    [setTimer, setSliderIndex],
  );

  useEffect(() => {
    localStorage.setItem("time", JSON.stringify({ hour, minute, second }));
  }, [hour, minute, second]);

  return (
    <div className="timer">
      {timer === "inactive" ? (
        <>
          <div className="slider">
            <div>
              <span className="label">Hours</span>
              <Slide
                type="hour"
                time={hour}
                maxTime={HOURS_PER_DAY}
                setTime={setTime}
                UIUpdateTrigger={UIUpdateTrigger}
                isSelected={sliderIndex === HOUR}
              />
            </div>
            <span>:</span>
            <div>
              <span className="label">Minutes</span>
              <Slide
                type="minute"
                time={minute}
                maxTime={MINUTES_PER_HOUR}
                setTime={setTime}
                UIUpdateTrigger={UIUpdateTrigger}
                isSelected={sliderIndex === MINUTE}
              />
            </div>
            <span>:</span>
            <div>
              <span className="label">Seconds</span>
              <Slide
                type="second"
                time={second}
                maxTime={SECONDS_PER_MINUTE}
                setTime={setTime}
                UIUpdateTrigger={UIUpdateTrigger}
                isSelected={sliderIndex === SECOND}
              />
            </div>
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
              localStorage.setItem(
                "timestamps",
                JSON.stringify(upsertTimestamp({ hour, minute, second })),
              );
              setTimer("active");
            }}
          >
            <PlayArrow />
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
