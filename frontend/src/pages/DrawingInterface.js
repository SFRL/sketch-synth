import { useState, useEffect, useCallback} from "react";
import { debounce } from "lodash";
import OSC from "osc-js";
import P5Sketch from "../components/P5Sketch";
import PredictionPanel from "../components/PredictionPanel";
import { Sketch } from "../scripts/sketchClasses";
import "../css/layout.css";
import "../css/button.css";

function DrawingInterface(props) {
  // State that is mainly used to force p5 sketch to rerender if participant clicks reset or changes screen size,
  // but it also tracks how often a reset happened
  const [reset, setReset] = useState(0);
  // Initialise sketch object (height and width will be set to true value in the setup function inside DrawingInterface)
  const [sketch, setSketch] = useState(new Sketch());
  const [oscWebSocket, setOscWebSocket] = useState(
    new OSC(new OSC.WebsocketClientPlugin({ host: "161.23.53.107", port: 8080 }))
  );
  
  // useState(new osc.WebSocketPort({
  //       url: "ws://localhost:12345",
  //       metadata: true
  //   }));


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
      <PredictionPanel sketch={sketch} osc={oscWebSocket}/>
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

export default DrawingInterface;
