import { useState, useEffect, useRef} from "react";
import {
  getSketchBoundingBox,
  extractSketch,
  createSketchImage,
  preprocessSketch,
  makePrediction,
} from "../scripts/tensorflowModel";
import shortstraw from "../scripts/shortstraw";
import { getClosestSynthId } from "../scripts/helper";
import synthParameters from "../json/parameters.json";
import SynthWrapper from "../components/SynthWrapper";
import "../css/prediction-panel.css";


const analyseSketch = async (sketch,canvas,globalNoisiness,globalThinness) => {

  const [x,y,l,h] = getSketchBoundingBox(sketch.strokes,sketch.width,sketch.height)
  
  if (l>0 && h>0) {
      const canvasSlice = createSketchImage(sketch.strokes,x,y,l,h,100,100);
      // const canvasSlice = extractSketch(sketch.canvas, x, y, l, h);
      const processedSketchImg = preprocessSketch(canvasSlice, canvas);
      const [noisy, thin] = await makePrediction(processedSketchImg);

      const shortstrawAnalysis = await shortstraw(sketch.strokes);

      // Get corner points coordinates
      const cornerIndices = shortstrawAnalysis[0];
      const resampleData = shortstrawAnalysis[3];
      const cornerCoords = {x:[],y:[]};

      cornerIndices.forEach((array,i)=>{
        const stroke = resampleData[i];
        array.forEach((index)=>{
          cornerCoords.x.push(stroke[0][index]);
          cornerCoords.y.push(stroke[1][index]);
        })
      })

      globalNoisiness = Math.min(
        Math.max(globalNoisiness + 2 * (noisy - 0.5), -12.3),
        12.3
      );

      globalThinness = Math.min(
        Math.max(globalThinness + 2 * (thin - 0.5), -12.3),
        12.3
      );

      // const id = await getClosestSynthId(globalNoisiness, globalThinness);
      const id = undefined;
      return { noisy: noisy, thin: thin, synthId: id , cornerCoords: cornerCoords};
  }
  else {
    return {noisy: 0.5, thin: 0.5, synthId: undefined, cornerPoints: []};
  }
 
}



function PredictionPanel({ callback, globalNoisiness, globalThinness, sketch }) {
  // const [globalNoisiness, setGlobalNoisiness] = useState(0);
  const [prediction, setPrediction] = useState([0.5,0.5]);
  const [synthId, setSynthId] = useState(undefined);
  const processedImage = useRef(null);

  const currentParameters = synthId
    ? synthParameters[synthId].parameters
    : undefined;
  
  // Make all synth sounds sustained
  if (currentParameters) {
    currentParameters.attack_1 = 0.0;
    currentParameters.sustain_1 = 1.0;
  }
  
  useEffect(() => {
    const getPrediction = () => {
      analyseSketch(sketch, processedImage.current, globalNoisiness, globalThinness)
        .then((analysis) => {
          // console.log(analysis.featureInfo?.acute);
          if (analysis.cornerCoords) sketch.updateCornerCoords(analysis.cornerCoords);
          setPrediction([analysis.noisy,analysis.thin]);
          setSynthId(analysis.synthId)

          setTimeout(() => callback({prediction: [analysis.noisy, analysis.thin], cornerPoints: []}), 1000);
        })
        .catch((error) => console.log(error));
    };
    getPrediction();

  }, [setPrediction, setSynthId, callback, sketch]);

  
  return (
    <div className="control-panel">
      <SynthWrapper parameters={currentParameters}/>
      <div className="prediction-panel">
        <p>Noisy: {`${prediction[0].toFixed(2)}`}</p>
        <p>Thin: {`${prediction[1].toFixed(2)}`}</p>
        <p>Synth ID: {synthId}</p>
        <canvas id="processedimage" ref={processedImage}></canvas>
        <p>Absolute noisiness: {`${globalNoisiness.toFixed(2)}`}</p>
        <p>Absolute thinness: {`${globalThinness.toFixed(2)}`}</p>
      </div>
    </div>
  );
}

export default PredictionPanel;
