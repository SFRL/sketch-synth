import { useState, useEffect, useRef} from "react";
import OSC from "osc-js";
import { HighlightOff, InfoRounded } from "@material-ui/icons";
import {
  createSketchImage,
  preprocessSketch,
  makePrediction,
} from "./scripts/tensorflowModel";
import "./css/prediction-panel.css";


const getOSCstatus = (statusID) => {
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


const analyseSketch = async (sketch,canvas) => {
  if (!sketch) return { noisy: 0.5, thin: 0.5, synthId: undefined, cornerPoints: [] };

  const [x,y,l,h] = sketch.getBoundingBox();
  const canvasSlice = createSketchImage(sketch.strokes,x,y,l,h,100,100);
  const processedSketchImg = preprocessSketch(canvasSlice, canvas);
  const [noisy, thin] = await makePrediction(processedSketchImg);

  const speed = sketch.getCurrentSpeed(3, true);
  const centerX = (x + 0.5*l)/sketch.width;
  const centerY = 1-(y + 0.5*h)/sketch.height;
  const width = l/sketch.width;
  const height = h/sketch.height;
  return { 
    noisy: noisy, 
    thin: thin, 
    acuteAngles: sketch.shortstraw ? sketch.shortstraw[2].acute : undefined, 
    speed: speed, 
    centerX: centerX, 
    centerY: centerY, 
    width: width, 
    height: height, 
    strokes: sketch.length, 
    length: sketch.totalStrokeLength};
}


const ControlPanel = ({sketch, osc, oscHost}) => {
  const [analysis, setAnalysis] = useState({
    noisy: undefined,
    thin: undefined,
    acuteAngles: undefined,
    speed: undefined,
    centerX: undefined,
    centerY: undefined,
    width: undefined,
    height: undefined,
    strokes: undefined,
    length: undefined,
  });

  const [displayPanel, setDisplayPanel] = useState(true);

  const toggleDisplay = (val) => setDisplayPanel(val);

  const processedImage = useRef(null);

  useEffect(()=>{
    osc.open({ host: oscHost, port: 8080 });
  },[osc,oscHost])
  
  useEffect(() => {
    const getPrediction = () => {
      analyseSketch(
        sketch,
        processedImage.current,
      )
        .then((analysis) => {
          setAnalysis(analysis)
          
          // Send data via Websocket OSC
          Object.keys(analysis).forEach((key)=> {
            if (typeof analysis[key] !== "undefined") {
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

      <div className="feature-display">
        <span>Noisy: {`${analysis.noisy?.toFixed(3)}`}</span>
        <span>Thin: {`${analysis.thin?.toFixed(3)}`}</span>
        <span>Acute angles: {analysis.acuteAngles}</span>
        <span>Speed: {`${analysis.speed?.toFixed(3)}`}</span>
        <span>CenterX: {`${analysis.centerX?.toFixed(3)}`}</span>
        <span>CenterY: {`${analysis.centerY?.toFixed(3)}`}</span>
        <span>Width: {`${analysis.width?.toFixed(3)}`}</span>
        <span>Height: {`${analysis.height?.toFixed(3)}`}</span>
        <span>Strokes: {analysis.strokes}</span>
        <span>Length: {analysis.length}</span>
        {getOSCstatus(osc.status())}
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
