import { useState, useEffect, useRef} from "react";
import OSC, {STATUS} from "osc-js";
import { HighlightOff, InfoRounded } from "@material-ui/icons";
import {
  createSketchImage,
  preprocessSketch,
  makePrediction,
} from "../scripts/tensorflowModel";
import "../css/prediction-panel.css";


const getOSCstatus = (statusID) => {
  switch(statusID) {
    case -1:
      return <span style={{backgroundColor:"grey"}}>OSC not initialised</span>
      break;
    case 0:
      return <span style={{ color: "green" }}>OSC trying to connect</span>;
      break;
    case 1:
      return (
        <span style={{ backgroundColor: "green" }}>OSC connection open</span>
      );
      break;
    case 2:
      return (
        <span style={{ color: "red" }}>
          OSC connection about to close
        </span>
      );
      break;
    case 3:
      return (
        <span style={{ backgroundColor: "red" }}>OSC connection closed</span>
      );
      break;
    default:
      return (
        <span style={{ backgroundColor: "red" }}>OSC status unknown</span>
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
  const width = l/sketch.width;
  const height = h/sketch.height;
  return { noisy: noisy, thin: thin, acuteAngles: sketch.shortstraw ? sketch.shortstraw[2].acute : undefined, speed: speed, centerX: centerX, width: width, height: height, pointCount: sketch.totalStrokeLength};
}


function PredictionPanel({sketch, osc}) {
  const [analysis, setAnalysis] = useState({
    noisy: undefined,
    thin: undefined,
    acuteAngles: undefined,
    speed: undefined,
    centerX: undefined,
    width: undefined,
    height: undefined,
    pointCount: undefined,
  });

  const [displayPanel, setDisplayPanel] = useState(true);

  const toggleDisplay = (val) => setDisplayPanel(val);

  const processedImage = useRef(null);

  useEffect(()=>{
    osc.open();
    console.log(STATUS);
  },[osc])
  
  useEffect(() => {
    const getPrediction = () => {
      analyseSketch(
        sketch,
        processedImage.current,
      )
        .then((analysis) => {
          setAnalysis(analysis)
          
          // Send data via OSC
          Object.keys(analysis).forEach((key)=> {
            if (analysis[key]) {
              const message = new OSC.Message(`/${key}`, analysis[key]);
              osc.send(message);
            }
          })

        
        })
        .catch((error) => console.log(error));
    };
      setTimeout(()=>{
        getPrediction();
      },1000);
  }, [sketch, analysis, osc, setAnalysis]);

  const content = displayPanel ? (
    <div className="control-panel expanded">
      <HighlightOff onClick={() => toggleDisplay(false)} />
      <div>
        <div className="canvas-container">
          <canvas id="processedimage" ref={processedImage}></canvas>
        </div>
        <p style={{textAlign: "center"}}>CNN input</p>
      </div>

      <div className="feature-display">
        <span>Noisy: {`${analysis.noisy?.toFixed(3)}`}</span>
        <span>Thin: {`${analysis.thin?.toFixed(3)}`}</span>
        <span>Number of acute angles: {analysis.acuteAngles}</span>
        <span>Drawing speed: {`${analysis.speed?.toFixed(3)}`}</span>
        <span>Center: {`${analysis.centerX?.toFixed(3)}`}</span>
        <span>Width: {`${analysis.width?.toFixed(3)}`}</span>
        <span>Height: {`${analysis.height?.toFixed(3)}`}</span>
        <span>Number of stroke points: {analysis.pointCount}</span>
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

export default PredictionPanel;
