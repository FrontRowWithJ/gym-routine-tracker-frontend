import { TimerDisplayProps } from "./types";
import "./TimerDisplay.css";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/Button";
import { Pause, PlayButton, Replay, Stop } from "@/resources/SVG";
import { bellring } from "@/resources/audio";

const finishedSound = new Audio(bellring);
finishedSound.loop = true;

const stopSound = () => {
  finishedSound.pause();
  finishedSound.currentTime = 0;
};

const playSound = () => finishedSound.play();
const radius = 50;
const strokeWidth = 5;

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;

const sendNotification = (
  notificationRef: React.RefObject<Notification | null>,
  stopVibration: () => void
) => {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      notificationRef.current = new Notification("00:00 ⌛ Time's up!", {
        dir: "auto",
        silent: false,
        requireInteraction: true,
      });
      notificationRef.current.addEventListener("close", () => {
        stopVibration();
        stopSound();
      });
    }
  });
};

export const TimerDisplay = ({ stopTimer, ...rest }: TimerDisplayProps) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const [time, setTime] = useState(rest);
  const [timerState, setTimerState] = useState<
    "active" | "inactive" | "finished"
  >("active");
  const requestRef = useRef<number>(0);
  const animationRef = useRef<Animation>(null);
  const notificationRef = useRef<Notification>(null);
  const vibrateInterval = useRef<NodeJS.Timer>(null);
  const totalSeconds =
    rest.hour * SECONDS_PER_HOUR +
    rest.minute * SECONDS_PER_MINUTE +
    rest.second;
  const initalTimeRef = useRef(performance.now());
  const pauseOffset = useRef(0);
  const pauseOffsetTally = useRef(0);

  const closeNotification = () => notificationRef.current?.close();

  const startVibration = () => {
    if (navigator.vibrate) {
      vibrateInterval.current = setInterval(() => navigator.vibrate(500), 1000);
    }
  };
  const stopVibration = () => {
    clearInterval(vibrateInterval.current ?? 0);
  };

  const animateLabel = useCallback(() => {
    const secondsElapsed = Math.floor(
      (performance.now() - (initalTimeRef.current + pauseOffset.current)) / 1000
    );
    if (secondsElapsed <= totalSeconds) {
      let t = totalSeconds - secondsElapsed;
      const hour = Math.floor(t / SECONDS_PER_HOUR);
      t -= hour * SECONDS_PER_HOUR;
      const minute = Math.floor(t / SECONDS_PER_MINUTE);
      t -= minute * SECONDS_PER_MINUTE;
      const second = t;
      setTime((curr) => {
        if (
          curr.hour !== hour ||
          curr.minute !== minute ||
          curr.second !== second
        ) {
          return { second, minute, hour };
        }
        return curr;
      });
      requestRef.current = requestAnimationFrame(animateLabel);
    } else {
      stopLabelAnimation();
    }
  }, [totalSeconds]);
  const startLabelAnimation = () =>
    (requestRef.current = requestAnimationFrame(animateLabel));
  const stopLabelAnimation = () => cancelAnimationFrame(requestRef.current);
  const pauseLabelAnimation = stopLabelAnimation;
  const startCircleAnimation = () => animationRef.current?.play();
  const pauseCircleAnimation = () => animationRef.current?.pause();
  const cancelCircleAnimation = () => {
    animationRef.current?.cancel();
    animationRef.current = null;
  };

  useLayoutEffect(() => {
    if (circleRef.current) {
      const { current: circle } = circleRef;
      const strokeDasharray = circle.getTotalLength();
      const keyframeEffect = new KeyframeEffect(
        circle,
        [
          { strokeDashoffset: 0, strokeDasharray },
          { strokeDashoffset: strokeDasharray, strokeDasharray },
        ],
        {
          direction: "normal",
          fill: "forwards",
          delay: 0,
          iterations: 1,
          duration: totalSeconds * 1000,
        }
      );
      animationRef.current = new Animation(keyframeEffect, document.timeline);
      animationRef.current.addEventListener("finish", () => {
        playSound();
        startVibration();
        sendNotification(notificationRef, stopVibration);
        setTimerState("finished");
      });
    }
    startCircleAnimation();
    return () => {
      closeNotification();
      stopVibration();
      stopSound();
      cancelCircleAnimation();
    };
  }, [totalSeconds]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateLabel);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animateLabel]);
  const setButton = (t: typeof timerState) => {
    if (t === "active") {
      return (
        <Button
          onClick={() => {
            pauseOffsetTally.current = performance.now();
            pauseCircleAnimation();
            pauseLabelAnimation();
            setTimerState("inactive");
          }}
        >
          <Pause />
        </Button>
      );
    }
    return (
      <Button
        onClick={() => {
          if (t === "inactive") {
            pauseOffset.current += performance.now() - pauseOffsetTally.current;
          } else {
            initalTimeRef.current = performance.now();
            pauseOffset.current = pauseOffsetTally.current = 0;
            setTime(rest);
            closeNotification();
          }
          startLabelAnimation();
          startCircleAnimation();
          setTimerState("active");
        }}
      >
        {t === "inactive" ? <PlayButton /> : <Replay />}
      </Button>
    );
  };
  return (
    <div className="timer-display">
      <div className="timer-display-container">
        <div className="timer-label">
          <span>{("" + time.hour).padStart(2, "0")}</span>
          <span>:</span>
          <span>{("" + time.minute).padStart(2, "0")}</span>
          <span>:</span>
          <span>{("" + time.second).padStart(2, "0")}</span>
        </div>
        <svg
          className="timer-circle"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        >
          <circle
            ref={circleRef}
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            strokeWidth={strokeWidth}
          />
        </svg>
      </div>
      <div className="button-container">
        {setButton(timerState)}
        <Button onClick={stopTimer}>
          <Stop />
        </Button>
      </div>
    </div>
  );
};
