import React from "react";
import { useEffect, useRef, useState} from "react";
import p5 from "p5";
import { Stroke } from "./scripts/sketchClasses";
import "./css/instructions.css";

// ------------------- "GLOBAL" VARIABLES -----------------------



//Sketch and stroke objects
let currentStroke = new Stroke();
let justFinished = false;

// tracking mouse touchpad and time
const tracking = {
  down: false,
  x: 0,
  y: 0,
  time: 0,
};

// ------------------- REACT COMPONENT ------------------------------

function P5Sketch(props) {
  // Reference to instructions and parent DOM
  const instructionsRef = useRef();
  const canvasParentRef = useRef();

  // State whether instructions should fade or not
  const [fade, setFade] = useState(false);

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
      // Set canvas element and size for this sketch instance
      currentSketch.setCanvas(canvas);
      currentSketch.setCanvasSize(w, h);

      console.log("p5 sketch loaded");
    };

    const draw = (p) => {
      // Clear background
      p.background(currentSketch.blendColour);
      if (currentStroke.length === 0) setFade(false);
      // record pen drawing from user
      if (tracking.down) {
        if (!justFinished) {
          // Reset stroke by assigning variable to new stroke object
          currentStroke = new Stroke();
          currentSketch.addStroke(currentStroke);
          // Activate predictions
          justFinished = true;
        }

        // If this is the first time something is drawn, set fade state to true to fade out instructions
        if (currentStroke.length === 0) setFade(true);

        currentStroke.addPoint(p.mouseX, p.mouseY, tracking.time);

        // Update last stroke of sketch
        currentSketch.updateLastStroke(currentStroke);
      }
      // pen is above the paper
      else if (justFinished) {
        // Flag that stroke is finished sketching
        currentStroke.isSketching = false;
        // Add stroke to sketch
        currentSketch.updateLastStroke(currentStroke);
        justFinished = false;
      }

      // Update total length of sketch
      currentSketch.updateTotalStrokeLength();

      // Draw sketch
      currentSketch.drawSketch(p, p.millis(),false);
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
