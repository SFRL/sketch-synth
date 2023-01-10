import { useState, useEffect } from "react";
import ReactHowler from "react-howler";
import { PlayArrow, Pause } from "@material-ui/icons";

function AudioPlayer({ autoplay, src }) {
  const [play, setPlay] = useState(autoplay);

  useEffect(() => {
    const handleKeyInput = (e) => {
      if (e.key === "s") {
        setPlay(!play);
      }
    };
    document.addEventListener("keydown", handleKeyInput);
    return () => document.removeEventListener("keydown", handleKeyInput);
  }, [setPlay, play]);

  return (
    <button onClick={() => setPlay(!play)}>
      {play ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
      <ReactHowler src={src} playing={play} loop={true} />
    </button>
  );
}

export default AudioPlayer;
