import { SavedTimestampsProps } from "./types";
import { Button } from "@/components/Button";
import { Timestamp } from "@/components/Timer";
import "./SavedTimestamps.css";

export const SavedTimestamps = ({ setTime, time }: SavedTimestampsProps) => {
  const timestampstr = localStorage.getItem("timestamps");
  if (!timestampstr) return false;
  const timestamps: Timestamp[] = JSON.parse(timestampstr);
  const { hour, minute, second } = time;
  return (
    <div className="saved-timestamps">
      <div>
        {timestamps.map((timestamp, key) => {
          const times = [timestamp.hour, timestamp.minute, timestamp.second];
          const isSelected =
            hour === timestamp.hour &&
            minute === timestamp.minute &&
            second === timestamp.second;
          return (
            <Button
              className="static-noise"
              key={key}
              style={{
                filter: isSelected ? "brightness(2)" : "",
              }}
              onClick={() => {
                setTime({ type: "all", timestamp });
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
