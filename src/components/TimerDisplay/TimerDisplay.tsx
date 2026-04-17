import { TimerDisplayProps, CountdownState } from "./types";
import "./TimerDisplay.css";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/Button";
import { Stop } from "@/resources/SVG";
import { bellring } from "@/resources/audio";
import { ToggleCountdownButton } from "./ToggleContdownButton";
import { Timestamp } from "@/components/Timer/types";
import { cancelPushNotification, subscribeUserToPush } from "@/misc";

const finishedSound = new Audio(bellring);
finishedSound.loop = true;

const stopSound = () => {
  finishedSound.pause();
  finishedSound.currentTime = 0;
};

const playSound = () => finishedSound.play();
const radius = 50;
const strokeWidth = 2;

export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const SECONDS_PER_HOUR = 3600;
export const MILLISECONDS_PER_SECOND = 1000;

export const TimerDisplay = ({
  stopTimer,
  hour,
  minute,
  second,
}: TimerDisplayProps) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const initialTimeRef = useRef(performance.now());
  const pauseOffset = useRef(0);
  const pauseOffsetTally = useRef(0);
  const [time, setTime] = useState<Timestamp>({ hour, minute, second });
  const [countdownState, setCountdownState] =
    useState<CountdownState>("active");
  const requestRef = useRef<number>(0);
  const animationRef = useRef<Animation>(null);
  const notificationRef = useRef<Notification>(null);
  const vibrateInterval = useRef<ReturnType<typeof setInterval>>(null);
  const notificationIDRef = useRef<string | null>(null);

  const totalSeconds = useMemo(
    () => hour * SECONDS_PER_HOUR + minute * SECONDS_PER_MINUTE + second,
    [hour, minute, second],
  );

  const closeNotification = useCallback(
    () => notificationRef.current?.close(),
    [],
  );

  const startVibration = useCallback(() => {
    if (navigator.vibrate) {
      vibrateInterval.current = setInterval(
        () => navigator.vibrate(500),
        1 * MILLISECONDS_PER_SECOND,
      );
    }
  }, []);

  const stopVibration = useCallback(() => {
    clearInterval(vibrateInterval.current ?? 0);
  }, []);

  const stopLabelAnimation = useCallback(
    () => cancelAnimationFrame(requestRef.current),
    [],
  );

  const animateLabel = useCallback(() => {
    const secondsElapsed = Math.floor(
      (performance.now() - (initialTimeRef.current + pauseOffset.current)) /
        MILLISECONDS_PER_SECOND,
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
  }, [totalSeconds, stopLabelAnimation]);

  const startLabelAnimation = useCallback(
    () => (requestRef.current = requestAnimationFrame(animateLabel)),
    [animateLabel],
  );
  const startCircleAnimation = useCallback(
    () => animationRef.current?.play(),
    [],
  );
  const pauseCircleAnimation = useCallback(
    () => animationRef.current?.pause(),
    [],
  );
  const cancelCircleAnimation = useCallback(() => {
    animationRef.current?.cancel();
    animationRef.current = null;
  }, []);

  const onPause = useCallback(() => {
    pauseOffsetTally.current = performance.now();
    pauseCircleAnimation();
    stopLabelAnimation();
    if (notificationIDRef.current) {
      cancelPushNotification(notificationIDRef.current);
      notificationIDRef.current = null;
    }
    setCountdownState("inactive");
  }, [pauseCircleAnimation, stopLabelAnimation]);

  const onResume = useCallback(() => {
    if (countdownState === "inactive") {
      pauseOffset.current += performance.now() - pauseOffsetTally.current;
    } else {
      initialTimeRef.current = performance.now();
      pauseOffset.current = pauseOffsetTally.current = 0;
      setTime({ hour, minute, second });
      closeNotification();
    }
    const secondsElapsed = Math.floor(
      (performance.now() - (initialTimeRef.current + pauseOffset.current)) /
        MILLISECONDS_PER_SECOND,
    );
    const remainingMs =
      (totalSeconds - secondsElapsed) * MILLISECONDS_PER_SECOND;
    subscribeUserToPush(remainingMs).then((notificationID) => {
      notificationIDRef.current = notificationID;
      stopSound();
      startLabelAnimation();
      startCircleAnimation();
      setCountdownState("active");
    });
  }, [
    startLabelAnimation,
    startCircleAnimation,
    closeNotification,
    countdownState,
    totalSeconds,
    hour,
    minute,
    second,
  ]);
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
          duration: totalSeconds * MILLISECONDS_PER_SECOND,
        },
      );
      animationRef.current = new Animation(keyframeEffect, document.timeline);
      animationRef.current.addEventListener("finish", () => {
        playSound();
        startVibration();
        setCountdownState("finished");
        notificationIDRef.current = null;
      });
    }
    startCircleAnimation();
    return () => {
      closeNotification();
      stopVibration();
      stopSound();
      cancelCircleAnimation();
    };
  }, [
    totalSeconds,
    startCircleAnimation,
    cancelCircleAnimation,
    closeNotification,
    startVibration,
    stopVibration,
  ]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      switch (event.data?.type) {
        case "TIMER_FINISHED":
          startVibration();
          playSound();
          setCountdownState("finished");
          notificationIDRef.current = null;
          break;
        case "TIMER_NOTIFICATION_CLOSED":
          stopSound();
          stopVibration();
          closeNotification();
          notificationIDRef.current = null;
          break;
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handler);
  }, [startVibration, stopVibration, closeNotification]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "TIMER_NOTIFICATION_CLOSED") {
        // handle dismissal
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateLabel);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animateLabel]);

  useEffect(() => {
    subscribeUserToPush(totalSeconds * MILLISECONDS_PER_SECOND).then(
      (id) => (notificationIDRef.current = id),
    );
  }, [totalSeconds]);

  return (
    <div className="timer-display">
      <div className="timer-display-container">
        <div className="timer-label">
          <span>{`0${time.hour}`.slice(-2)}</span>
          <span>:</span>
          <span>{`0${time.minute}`.slice(-2)}</span>
          <span>:</span>
          <span>{`0${time.second}`.slice(-2)}</span>
        </div>
        <svg
          className="timer-circle"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        >
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            strokeWidth={strokeWidth}
            strokeLinecap={"round"}
          />
          <circle
            ref={circleRef}
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            strokeWidth={strokeWidth}
            strokeLinecap={"round"}
          />
        </svg>
      </div>
      <div className="button-container">
        <ToggleCountdownButton
          countdownState={countdownState}
          onPause={onPause}
          onResume={onResume}
        />
        <Button
          onClick={() => {
            if (notificationIDRef.current) {
              cancelPushNotification(notificationIDRef.current);
              notificationIDRef.current = null;
            }
            stopTimer();
          }}
        >
          <Stop />
        </Button>
      </div>
    </div>
  );
};
