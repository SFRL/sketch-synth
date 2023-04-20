import { useState, useEffect, useRef} from "react";
import OSC from "osc-js";
import { HighlightOff, InfoRounded } from "@material-ui/icons";
import { Sketch } from "./scripts/sketchClasses";
import {analyseSketch} from "./scripts/analyseSketch";
import "./css/controlpanel.css";


const getOSCstatus = (statusID:number) => {
  switch(statusID) {
    case -1:
      return <span style={{backgroundColor:"grey"}}>OSC not initialised</span>
    case 0:
      return <span style={{ color: "green" }}>OSC connecting</span>;
    case 1:
      return (
        <span style={{ backgroundColor: "green" }}>OSC open</span>
      );
    case 2:
      return (
        <span style={{ color: "red" }}>
          OSC closing
        </span>
      );
    case 3:
      return (
        <span style={{ backgroundColor: "red" }}>OSC closed</span>
      );
    default:
      return (
        <span style={{ backgroundColor: "red" }}>OSC unknown</span>
      );
  }
}




const ControlPanel = ({sketch, osc}:{sketch:Sketch,osc:OSC}) => {
  const [analysis, setAnalysis] = useState(analyseSketch(sketch));

  const [displayPanel, setDisplayPanel] = useState(true);

  const toggleDisplay = (val:boolean) => setDisplayPanel(val);

  const processedImage = useRef<HTMLCanvasElement>(null);
  const processedSlice = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const getPrediction = () => {
      analyseSketch(
        sketch,
        processedImage.current,
        processedSlice.current
      )
        .then((analysis) => {
          setAnalysis(analysis)
          
          // Send data via Websocket OSC
          Object.keys(analysis).forEach((key)=> {
            if (typeof analysis[key] !== "undefined" && osc.status()===1) {
              const message = new OSC.Message(`/${key}`, analysis[key]);
              osc.send(message);
            }
          })
        })
        .catch((error) => console.log(error));
    };
      setTimeout(()=>{
        getPrediction();
      },100);
  }, [sketch, analysis, osc, setAnalysis]);


  const content = displayPanel ? (
    <div className="control-panel expanded">
      <HighlightOff onClick={() => toggleDisplay(false)} />
      <div>
        <div className="canvas-container">
          <canvas id="processedimage" ref={processedImage}></canvas>
        </div>
        <p style={{ textAlign: "center" }}>CNN input</p>
      </div>
      <div>
        <div className="canvas-container">
          <canvas id="processedslice" ref={processedSlice}></canvas>
        </div>
        <p style={{textAlign: "center"}}>CNN slice input</p>
      </div>

      <div className="feature-display">
        <span>Noisy: {`${analysis.noisy?.toFixed(3)}`}</span>
        <span>Thin: {`${analysis.thin?.toFixed(3)}`}</span>
        <span>Feature: {analysis.feature}</span>
        <span>Speed: {`${analysis.speed?.toFixed(3)}`}</span>
        <span>CenterX: {`${analysis.centerX?.toFixed(3)}`}</span>
        <span>CenterY: {`${analysis.centerY?.toFixed(3)}`}</span>
        <span>Width: {`${analysis.width?.toFixed(3)}`}</span>
        <span>Height: {`${analysis.height?.toFixed(3)}`}</span>
        <span>Strokes: {analysis.strokes}</span>
        <span>Length: {analysis.length}</span>
        {getOSCstatus(osc.status())}
      </div>
      <div>
        {
        sketch ? 
        Object.keys(sketch.featureColours).map((feature) => {
          const colour = sketch.featureColours[feature];
          return <div key={feature} style={{"backgroundColor":`rgb(${colour[0]},${colour[1]},${colour[2]})`}}>{feature}</div>
        })
        : undefined   
      }
      </div>
    </div>
  ) : (
    <div className="control-panel">
      <InfoRounded onClick={() => toggleDisplay(true)} />
    </div>
  );

  
  return <>{content}</>;
}

export default ControlPanel;
