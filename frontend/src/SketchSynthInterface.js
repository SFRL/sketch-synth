import { useState, useEffect} from "react";
import { debounce } from "lodash";
import OSC from "osc-js";
import P5Sketch from "./P5Sketch";
import ControlPanel from "./ControlPanel";
import { Sketch } from "./scripts/sketchClasses";
import "./css/layout.css";
import "./css/button.css";

const SketchSynthInterface = (props) => {
  // State that is mainly used to force p5 sketch to rerender if participant clicks reset or changes screen size,
  // but it also tracks how often a reset happened
  const [reset, setReset] = useState(0);
  // Initialise sketch object (height and width will be set to true value in the setup function inside DrawingInterface)
  const [sketch, setSketch] = useState(new Sketch());
  const [oscWebSocket, setOscWebSocket] = useState(
    new OSC()
  );

  useEffect(() => {
    // Re-render sketch when window size is changed, use debounce to prevent triggering too many re-renders
    const debouncedHandleResize = debounce(() => setReset((r) => r + 1), 200);
    window.addEventListener("resize", debouncedHandleResize);
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, [setReset]);

  return (
    <>
      <ControlPanel 
        sketch={sketch} 
        osc={oscWebSocket} 
        oscHost={props.oscHost}
      />
      <P5Sketch
        sketch={sketch}
        rdp={props.rdp}
        maxLength={props.maxLength}
        minLength={props.minLength}
        freeze={false}
        instructions={`Draw a ${props.instructions} sound`}
      />
    </>
  );
}

export default SketchSynthInterface;
