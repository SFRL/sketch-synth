import { useState, useEffect} from "react";
import { debounce } from "lodash";
import OSC from "osc-js";
import P5Sketch from "./P5Sketch";
import ControlPanel from "./ControlPanel";
import { Sketch } from "./scripts/sketchClasses";
import "./css/layout.css";
import "./css/button.css";

const SketchSynthInterface = ({oscHost, https, instructions}:{oscHost:string, https:boolean, instructions:string}) => {
  // State that is mainly used to force p5 sketch to rerender if participant clicks reset or changes screen size,
  // but it also tracks how often a reset happened
  const [reset, setReset] = useState(0);
  // Initialise sketch object (height and width will be set to true value in the setup function inside DrawingInterface)
  const [sketch] = useState(new Sketch());
  const [osc] = useState(new OSC());

  useEffect(() => osc.open({ host: oscHost, port: 8080, secure: https}),[osc, oscHost, https]);

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
        osc={osc}
      />
      <P5Sketch
        sketch={sketch}
        instructions={`Draw a ${instructions} sound`}
      />
    </>
  );
}

export default SketchSynthInterface;
