import React from "react";
import PredictionPanel from "../components/PredictionPanel";
import { useEffect, useRef, useState, useCallback } from "react";
import p5 from "p5";
// import Sketch from "./Sketch";
import { Stroke } from "../scripts/sketchClasses";
import "../css/instructions.css";

// ------------------- "GLOBAL" VARIABLES -----------------------

//   General parameters that can be changed with react props
const paras = {
  rdp: 2,
  maxLength: 150,
  minLength: 20,
  lineColour: [0, 0, 0],
  blendColour: [255, 255, 255],
  lineWidth: 6,
  decay: 0.0001,
};

//Sketch and stroke objects
let currentStroke = new Stroke(
  paras.lineColour,
  paras.lineWidth,
  paras.blendColour,
  paras.decay
);
let justFinished = false;

// tracking mouse touchpad and time
const tracking = {
  down: false,
  x: 0,
  y: 0,
  time: 0,
};

// ------------------- FUNCTIONS -----------------------

// Clear Screen
const clearScreen = (p) => p.background(paras.blendColour);

// ------------------- REACT COMPONENT ------------------------------

function P5Sketch(props) {
  // Reference to instructions and parent DOM
  const instructionsRef = useRef();
  const canvasParentRef = useRef();

  // State whether instructions should fade or not
  const [fade, setFade] = useState(false);
  const [globalNoisiness, setGlobalNoisiness] = useState(0);
  const [globalThinness, setGlobalThinness] = useState(0);
  const [predictionNumber, setPredictionNumber] = useState(0);
  
  const updatePredictions = useCallback(
    (values) => {
      setGlobalNoisiness(
        Math.min(Math.max(globalNoisiness + 2 * (values[0] - 0.5), -12.3), 12.3)
      );
      setGlobalThinness(
        Math.min(Math.max(globalThinness + 2 * (values[1] - 0.5), -12.3), 12.3)
      );
      setPredictionNumber(predictionNumber + 1);
    },
    [setPredictionNumber, predictionNumber, setGlobalNoisiness, globalNoisiness, setGlobalThinness, globalThinness]
  );

  useEffect(() => {
    // The sketch object holding the participant input, passed from parent
    const currentSketch = props.sketch;
    const canvasParent = canvasParentRef.current;

    // Define functions to handle mouse events
    const detectRightClick = () => (tracking.down = false);
    const startTracking = () => (tracking.down = true);
    const endTracking = () => (tracking.down = false);

    const setup = (p, canvasParentRef) => {
      // Get position of parent element to calculate height of canvas to fit screen
      const offsetY = canvasParentRef.offsetTop + 3;
      const w = window.innerWidth;
      const h = window.innerHeight - offsetY;
      const canvas = p.createCanvas(w, h).parent(canvasParentRef);
      // Add event listeners
      canvasParent.addEventListener("contextmenu", detectRightClick);

      canvasParent.addEventListener("touchstart", startTracking);
      canvasParent.addEventListener("touchend", endTracking);
      canvasParent.addEventListener("mousedown", startTracking);
      canvasParent.addEventListener("mouseup", endTracking);

      const addPoint = () => {
        tracking.x = p.mouseX;
        tracking.y = p.mouseY;
        tracking.time = p.millis();  
      }

      canvas.mouseMoved(addPoint);
      canvas.touchMoved(addPoint);
      
      p.frameRate(30);
      if (!props.freeze) {
        setFade(false);
        clearScreen(p);
      }
      // Set canvas element and size for this sketch instance
      currentSketch.setCanvas(canvas);
      currentSketch.setCanvasSize(w, h);

      // Update parameters from props
      for (let key in props) {
        if (key in paras) {
          paras[key] = props[key];
        }
      }

      console.log("p5 sketch loaded");
    };

    const draw = (p) => {
      clearScreen(p);
      if (currentStroke.length === 0) setFade(false);
      // record pen drawing from user, if sketch isn't frozen
      if (tracking.down && !props.freeze) {
        if (!justFinished) {
          // Reset stroke by assigning variable to new stroke object
          currentStroke = new Stroke(
            paras.lineColour,
            paras.lineWidth,
            paras.blendColour,
            paras.decay
          );
          currentSketch.addStroke(currentStroke);
          // Activate predictions
          justFinished = true;
          // Activate prediction loop in parent
          // props.callback(true);
        }

        // If this is the first time something is drawn, set fade state to true to fade out instructions
        if (currentStroke.length === 0) setFade(true);

        currentStroke.addPoint(p.mouseX, p.mouseY, tracking.time);

        // Draw stroke
        currentStroke.drawStroke(p, p.millis(), false);

        // Update last stroke of sketch
        currentSketch.updateLastStroke(currentStroke);
      }
      // pen is above the paper
      else if (justFinished) {
        // Simplify after stroke is finished
        currentStroke.simplify(paras.rdp);

        // Add stroke to sketch
        currentSketch.updateLastStroke(currentStroke);

        justFinished = false;
      }

      // Draw sketch
      currentSketch.drawSketch(p, p.millis(), true);
    };

    const sketchInstance = new p5((p) => {
      p.setup = () => {
        setup(p, canvasParentRef.current);
      };
      p.draw = () => draw(p);
    });

    return () => {
      console.log("Unmout P5 canvas component");
      sketchInstance.remove();
      canvasParent.removeEventListener("contextmenu", detectRightClick);
      canvasParent.removeEventListener("touchstart", startTracking);
      canvasParent.removeEventListener("touchend", endTracking);
      canvasParent.removeEventListener("mouseup", startTracking);
      canvasParent.removeEventListener("mousedown", endTracking);
    };
  }, [props, setFade]);

  useEffect(() => {
    instructionsRef.current.style.opacity = fade ? 0 : 1;
  }, [fade]);

  return (
    <>
      <PredictionPanel
        sketch={props.sketch}
        globalNoisiness={globalNoisiness}
        globalThinness={globalThinness}
        predictionNumber={predictionNumber}
        callback={updatePredictions}
      />
      <section className={"instructions"} ref={instructionsRef}>
        {props.instructions}
      </section>
      <div
        ref={canvasParentRef}
        className={props.className || "react-p5"}
        data-testid="react-p5"
        style={props.style || {}}
      />
    </>
  );
}

export default P5Sketch;
