import { useState, useEffect} from "react";
import { debounce } from "lodash";
import P5Sketch from "../components/P5Sketch";
import { Sketch } from "../scripts/sketchClasses";

import "../css/layout.css";
import "../css/button.css";

function DrawingInterface(props) {
  // State that is mainly used to force p5 sketch to rerender if participant clicks reset or changes screen size,
  // but it also tracks how often a reset happened
  const [reset, setReset] = useState(0);
  const [popup, setPopup] = useState("");
  // Initialise sketch object (height and width will be set to true value in the setup function inside DrawingInterface)
  const [sketch, setSketch] = useState(new Sketch());
  const [allowPrediction, setAllowPrediction] = useState(false);
  const [prediction, setPrediction] = useState(0.5);

  useEffect(() => {
    // Re-render sketch when window size is changed, use debounce to prevent triggering too many re-renders
    const debouncedHandleResize = debounce(() => setReset(reset + 1), 200);
    window.addEventListener("resize", debouncedHandleResize);
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, [setReset]);

  const header = <>{<h1>SketchSynth</h1>}</>;

  return (
    <>
      <P5Sketch
        sketch={sketch}
        rdp={props.rdp}
        maxLength={props.maxLength}
        minLength={props.minLength}
        freeze={popup ? true : false}
        instructions={`Draw a ${props.instructions} sound`}
      />
      {popup}
    </>
  );
}

export default DrawingInterface;
