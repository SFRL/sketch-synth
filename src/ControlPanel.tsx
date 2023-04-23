import { useState, useEffect, useRef} from "react";
import OSC from "osc-js";
import { HighlightOff, InfoRounded } from "@material-ui/icons";
import { Sketch, FeatureColours } from "./scripts/sketchClasses";
import {analyseSketch,defaultSketchAnalysis} from "./scripts/analyseSketch";
import { ExperimentSynth } from "./scripts/wavetableSynth";
import "./css/controlpanel.css";

type SketchAnalysis = typeof defaultSketchAnalysis;
type featureType = keyof SketchAnalysis;
const featureNames = Object.keys(defaultSketchAnalysis)

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


const mapToWebSynth = (analysis:SketchAnalysis,synth:ExperimentSynth) => {
  if (analysis.length > 0) {
    const x = Math.min(analysis.thin,0.999999);
    const y = Math.min(analysis.noisy,0.999999);
    synth.setParams(x,y);
    synth.noteOn(41);
  }
  else {
    synth.noteOff();
  }
}



const getFeatureDisplay = (feature:featureType,analysis:SketchAnalysis) => {
  if (feature === "feature" || feature === "strokes" || feature === "length") return <span key={feature}>{feature}: {analysis[feature]}</span>
  else return <span key={feature}>{feature}: {`${analysis[feature].toFixed(3)}`}</span>
}

const ControlPanel = ({sketch, osc,toggleShowFeatures,synth}:{sketch:Sketch,osc:OSC,toggleShowFeatures:Function,synth:ExperimentSynth}) => {
  // Object storing latest analysis of sketch (feature extraction)
  const [analysis, setAnalysis] = useState<SketchAnalysis>(defaultSketchAnalysis);
  // Display GUI for control panel
  const [displayPanel, setDisplayPanel] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

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

          mapToWebSynth(analysis,synth);
          
          // Send data via Websocket OSC
          if (osc.status()===1) {
            Object.keys(analysis).forEach((key)=> {
                const message = new OSC.Message(`/${key}`, analysis[key as featureType]);
                osc.send(message);
            })
          }
        })
        .catch((error) => console.log(error));
    };
      setTimeout(()=>{
        getPrediction();
      },100);
  }, [sketch, analysis, osc, setAnalysis, synth]);





  const content = displayPanel ? (
    <div className="control-panel expanded">
      <HighlightOff onClick={() => setDisplayPanel(false)} />
      
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
        {Object.keys(analysis).map((feature) => getFeatureDisplay(feature as featureType,analysis))}
        <button onClick={()=>toggleShowFeatures()}>Toggle Features</button>
        {/* <button onClick={()=>toggleSynth(synth,isPlaying,setIsPlaying)}>{isPlaying?"Stop":"Play"}</button> */}
        {getOSCstatus(osc.status())}
      </div>
      <div>
        {
        sketch ? 
        Object.keys(sketch.featureColours).map((featureColour) => {
          const colour = sketch.featureColours[featureColour as keyof FeatureColours];
          return <div key={featureColour} style={{"backgroundColor":`rgb(${colour[0]},${colour[1]},${colour[2]})`}}>{featureColour}</div>
        })
        : undefined   
      }
      </div>
    </div>
  ) : (
    <div className="control-panel">
      <InfoRounded onClick={() => setDisplayPanel(true)} />
    </div>
  );

  
  return <>{content}</>;
}

export default ControlPanel;
