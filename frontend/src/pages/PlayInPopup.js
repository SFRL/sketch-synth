import { useState, useEffect } from "react";
import AudioPlayer from "../components/AudioPlayer";
import SynthWrapper from "../components/SynthWrapper";
import Popup from "../components/Popup";
import Survey from "./PopupSurvey";

import { Loop } from "@material-ui/icons";

import "../css/loading.css";

// Pick audio element depending on props
const getAudioElement = (props) => {
  if (props.parameters)
    return (
      <SynthWrapper
        parameters={props.parameters}
        note={props.note}
        autoplay={props.autoplay}
      />
    );
  if (props.src) return <AudioPlayer src={props.src} autoPlay={true} />;

  return "";
};

const PlayInPopup = (props) => {
  // Save content as state, initial state is a loading screen
  const [content, setContent] = useState("");

  useEffect(() => {
    if (props.parameters) {
      const audioElement = getAudioElement({
        ...props,
        parameters: props.parameters,
      });
      setContent(
        <Survey audioElement={audioElement} callback={props.callback} />
      );
    } else {
      setContent(
        <>
          <h1>Loading</h1>
          <Loop className={"loading-loop"} style={{ fontSize: "3em" }} />
        </>
      );
    }
  }, [setContent, props]);

  return (
    <Popup>
      <div className="center">{content}</div>
    </Popup>
  );
};

export default PlayInPopup;
