import { YoutubeVideoPlayerProps } from "./types";
import "./YoutubeVideoPlayer.css";
import { useEffect, useState } from "react";
import { OPEN, CLOSE } from "@/misc";

export const YoutubeVideoPlayer = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(CLOSE);
  const setDialog = (event: React.BaseSyntheticEvent, state: boolean) => {
    event.stopPropagation();
    setIsDialogOpen(state);
  };

  useEffect(() => {
    if (!isDialogOpen) return;
    const controller = new AbortController();
    window.addEventListener(
      "keydown",
      ({ code }) => code === "Escape" && setIsDialogOpen(CLOSE),
      { signal: controller.signal }
    );
    return () => controller.abort();
  }, [isDialogOpen]);

  const YoutubePlayerDialog = (props: YoutubeVideoPlayerProps) => (
    <dialog
      className="youtube-player-dialog"
      open={isDialogOpen}
      onClick={(event) => {
        if (event.target === event.currentTarget) setDialog(event, CLOSE);
      }}
    >
      <div className="youtube-player">
        <iframe
          src={`https://www.youtube.com/embed/${props.videoID}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded youtube"
        />
      </div>
    </dialog>
  );
  return [
    (event: React.BaseSyntheticEvent) => setDialog(event, OPEN),
    YoutubePlayerDialog,
  ] as const;
};
