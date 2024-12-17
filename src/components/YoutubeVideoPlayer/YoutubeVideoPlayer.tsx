import { Button } from "@/components/Button";
import { YoutubeVideoPlayerProps } from "./types";
import "./YoutubeVideoPlayer.css";
import YouTube from "react-youtube";
import { Close } from "@/resources/SVG";

export const YoutubeVideoPlayer = (props: YoutubeVideoPlayerProps) => {
  return (
    <div className="youtube-player-container">
      <YouTube className="youtube-player" videoId={props.videoID} />
      <div className="youtube-player-buttons">
        <Button onClick={props.disableVideo}>
          <Close />
        </Button>
      </div>
    </div>
  );
};
