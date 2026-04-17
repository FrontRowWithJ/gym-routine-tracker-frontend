import { SavedTimestampsProps } from "./types";
import { Button } from "@/components/Button";
import { Timestamp } from "@/components/Timer";
import "./SavedTimestamps.css";
import { useRef, useMemo } from "react";
import { useWindowEvent } from "@/misc/hooks";
import { OFF, MOUSE_DOWN, DRAGGING } from "@/misc";

export const SavedTimestamps = ({ setTime, time }: SavedTimestampsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<number>(0);
  const scrollLeftRef = useRef(0);
  const startXRef = useRef(0);
  const timestamps: Timestamp[] = useMemo(
    () => JSON.parse(localStorage.getItem("timestamps") ?? "[]"),
    [],
  );
  const { hour, minute, second } = time;

  useWindowEvent(
    "mousemove",
    (event) => {
      if (dragStateRef.current === OFF || !containerRef.current) return;
      event.preventDefault();
      dragStateRef.current = DRAGGING;
      const container = containerRef.current;
      container.scrollLeft =
        scrollLeftRef.current - (event.clientX - startXRef.current);
    },
    [],
  );
  useWindowEvent("mouseup", () => (dragStateRef.current = OFF));
  return (
    <div
      className="saved-timestamps"
      onMouseDown={(event) => {
        if (!containerRef.current || dragStateRef.current !== OFF) return;
        dragStateRef.current = MOUSE_DOWN;
        startXRef.current = event.clientX;
        scrollLeftRef.current = containerRef.current.scrollLeft;
      }}
      ref={containerRef}
    >
      <div>
        {timestamps.map((timestamp) => {
          const times = [timestamp.hour, timestamp.minute, timestamp.second];
          const isSelected =
            hour === timestamp.hour &&
            minute === timestamp.minute &&
            second === timestamp.second;
          return (
            <Button
              className="static-noise"
              key={`${timestamp.hour}-${timestamp.minute}-${timestamp.second}`}
              style={{ filter: isSelected ? "brightness(2)" : "" }}
              onMouseUp={() => {
                // if state == mouseDown -> no dragging occured -> proper click event
                if (dragStateRef.current === MOUSE_DOWN) {
                  setTime({ type: "all", timestamp });
                }
                dragStateRef.current = OFF;
              }}
            >
              {times.map((t) => ("" + t).padStart(2, "0")).join(":")}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
