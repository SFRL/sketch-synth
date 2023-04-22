import { useState, useEffect, useCallback} from "react";
import { debounce } from "lodash";
import OSC from "osc-js";
import P5Sketch from "./P5Sketch";
import ControlPanel from "./ControlPanel";
import { Sketch } from "./scripts/sketchClasses";
import { ExperimentSynth } from "./scripts/wavetableSynth";
import "./css/layout.css";
import "./css/button.css";



const SketchSynthInterface = ({oscHost, https, instructions,synth}:{oscHost:string, https:boolean, instructions:string, synth:ExperimentSynth}) => {
  // State that is mainly used to force p5 sketch to rerender if participant clicks reset or changes screen size,
  // but it also tracks how often a reset happened
  const [reset, setReset] = useState(0);
    // State whether sketch featured are visualised or not
  const [showFeatures, setShowFeatures] = useState(false);
  const toggleShowFeatures = useCallback(() => setShowFeatures(!showFeatures), [showFeatures, setShowFeatures]);

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
        toggleShowFeatures={toggleShowFeatures}
        synth={synth}
      />
      <P5Sketch
        sketch={sketch}
        instructions={`Draw a ${instructions} sound`}
        showFeatures={showFeatures}
      />
    </>
  );
}

export default SketchSynthInterface;
