import { YoutubeVideoPlayerProps } from "./types";
import "./YoutubeVideoPlayer.css";
import YouTube from "react-youtube";
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
      <YouTube className="youtube-player" videoId={props.videoID} />
    </dialog>
  );
  return [
    (event: React.BaseSyntheticEvent) => setDialog(event, OPEN),
    YoutubePlayerDialog,
  ] as const;
};
