import { useState, useEffect, useRef} from "react";
import { makePrediction } from "../scripts/tensorflowModel";
import { getClosestSynthId } from "../scripts/helper";
import synthParameters from "../json/parameters.json";
import SynthWrapper from "../components/SynthWrapper";
import "../css/prediction-panel.css";


const analyseSketch = async (sketch,canvas,globalNoisiness,globalThinness) => {
  const [noisy,thin] = await makePrediction(sketch,canvas);

  globalNoisiness = Math.min(
    Math.max(globalNoisiness + 2 * (noisy - 0.5), -12.3),
    12.3
  );

  globalThinness = Math.min(
      Math.max(globalThinness + 2 * (thin - 0.5), -12.3),
      12.3
    );
  
  const id = await getClosestSynthId(globalNoisiness,globalThinness);


  return {"noisy":noisy,"thin":thin,"synthId":id}
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
        .then((anaylsis) => {
          // console.log(result);
          setPrediction([anaylsis.noisy,anaylsis.thin]);
          setSynthId(anaylsis.synthId)

          setTimeout(() => callback([anaylsis.noisy, anaylsis.thin]), 1000);
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
