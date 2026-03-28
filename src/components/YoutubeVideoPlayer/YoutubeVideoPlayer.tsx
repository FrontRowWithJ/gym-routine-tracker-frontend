import { YoutubeVideoPlayerProps } from "./types";
import "./YoutubeVideoPlayer.css";
import { useState } from "react";
import { useWindowEvent } from "@/misc/hooks";

export const YoutubeVideoPlayer = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const setDialog = (event: React.BaseSyntheticEvent, isOpen: boolean) => {
    event.stopPropagation();
    setIsDialogOpen(isOpen);
  };

  useWindowEvent(
    !isDialogOpen,
    "keydown",
    ({ code }) => code === "Escape" && setIsDialogOpen(false),
    [isDialogOpen]
  );

  const YoutubePlayerDialog = (props: YoutubeVideoPlayerProps) => (
    <dialog
      className="youtube-player-dialog"
      open={isDialogOpen}
      onClick={(event) => {
        if (event.target === event.currentTarget) setDialog(event, false);
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
    (event: React.BaseSyntheticEvent) => setDialog(event, true),
    YoutubePlayerDialog,
  ] as const;
};
