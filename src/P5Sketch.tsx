import React from "react";
import { useEffect, useRef, useState} from "react";
import p5 from "p5";
import { Sketch, Stroke } from "./scripts/sketchClasses";
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

// Define functions to handle mouse events
const detectRightClick = () => (tracking.down = false);
const startTracking = () => (tracking.down = true);
const endTracking = () => (tracking.down = false);

// ------------------- P5 FUNCTIONS ------------------------------
const setup = (p:p5, canvasParent:HTMLDivElement, sketch:Sketch) => {
  // Get position of parent element to calculate height of canvas to fit screen
  const offsetY = canvasParent.offsetTop + 3;
  const w = window.innerWidth;
  const h = window.innerHeight - offsetY;
  const canvas = p.createCanvas(w, h).parent(canvasParent);
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
  sketch.setCanvas(canvas);
  sketch.setCanvasSize(w, h);

  console.log("p5 sketch loaded");
};

const draw = (p:p5,sketch:Sketch,setFade:Function) => {
  // Clear background
  p.background(sketch.blendColour);
  if (currentStroke.length === 0) setFade(false);
  // record pen drawing from user
  if (tracking.down) {
    if (!justFinished) {
      // Reset stroke by assigning variable to new stroke object
      currentStroke = new Stroke();
      sketch.addStroke(currentStroke);
      // Activate predictions
      justFinished = true;
    }

    // If this is the first time something is drawn, set fade state to true to fade out instructions
    if (currentStroke.length === 0) setFade(true);

    currentStroke.addPoint(p.mouseX, p.mouseY, tracking.time);

    // Update last stroke of sketch
    sketch.updateLastStroke(currentStroke);
  }
  // pen is above the paper
  else if (justFinished) {
    // Flag that stroke is finished sketching
    currentStroke.isSketching = false;
    // Add stroke to sketch
    sketch.updateLastStroke(currentStroke);
    justFinished = false;
  }

  // Update total length of sketch
  sketch.updateTotalStrokeLength();

  // Draw sketch
  sketch.drawSketch(p, p.millis(),false);
};

// ------------------- REACT COMPONENT ------------------------------

function P5Sketch({sketch, instructions} : {sketch: Sketch, instructions: string}) {
  // Reference to instructions and parent DOM
  const instructionsRef = useRef<HTMLDivElement>(null);
  const canvasParentRef = useRef<HTMLDivElement>(null);

  // State whether instructions should fade or not
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // The sketch object holding the participant input, passed from parent
    const canvasParent = canvasParentRef.current;

    // Run p5 sketch
    const sketchInstance = new p5((p) => {
      p.setup = () => {
        if (canvasParent) setup(p,canvasParent,sketch);
        else console.log("Error: canvasParent not defined");
      };
      p.draw = () => draw(p,sketch,setFade);
    });

    // Remove p5 sketch and clean up event listeners
    return () => {
      console.log("Unmout P5 canvas component");
      sketchInstance.remove();
      canvasParent?.removeEventListener("contextmenu", detectRightClick);
      canvasParent?.removeEventListener("touchstart", startTracking);
      canvasParent?.removeEventListener("touchend", endTracking);
      canvasParent?.removeEventListener("mouseup", startTracking);
      canvasParent?.removeEventListener("mousedown", endTracking);
    };
  }, [sketch, setFade]);

  // Fade out instructions when user starts drawing
  useEffect(() => {
    // Check that instructionsRef is pointing to a DOM element
    if (instructionsRef.current) {
      instructionsRef.current.style.opacity = fade ? "0" : "1";
    }
  }, [fade]);

  return (
    <>
      <section className={"instructions"} ref={instructionsRef}>
        {instructions}
      </section>
      <div
        ref={canvasParentRef}
        className={"react-p5"}
        data-testid="react-p5"
      />
    </>
  );
}

export default P5Sketch;
