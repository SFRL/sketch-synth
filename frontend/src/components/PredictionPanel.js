import { useState, useEffect, useRef, useCallback } from "react";
import { preprocessSketch, makePrediction } from "../scripts/tensorflowModel";
import SynthWrapper from "../components/SynthWrapper";
import "../css/prediction-panel.css";

function PredictionPanel({ callback, globalNoisiness, sketch }) {
  // const [globalNoisiness, setGlobalNoisiness] = useState(0);
  const [prediction, setPrediction] = useState(0.5);
  const processedImage = useRef(null);

  //

  // const updateGlobalNoisiness = useCallback(
  //   (val) =>
  //     setGlobalNoisiness(
  //       Math.min(Math.max(globalNoisiness + val, -12.3), 12.3)
  //     ),
  //   [setGlobalNoisiness, globalNoisiness]
  // );

  useEffect(() => {
    const getPrediction = () => {
      makePrediction(sketch, processedImage.current)
        .then((result) => {
          // console.log(result[0]);
          setPrediction(result[0]);
          setTimeout(() => callback(2 * (result[0] - 0.5)), 1000);
        })
        .catch((error) => console.log(error));
    };
    getPrediction();
  }, [setPrediction, callback, sketch]);

  return (
    <div className="control-panel">
      <SynthWrapper />
      <div className="prediction-panel">
        <p>Prediction: {`${prediction.toFixed(2)}`}</p>
        <canvas id="processedimage" ref={processedImage}></canvas>
        <p>Absolute noisiness: {`${globalNoisiness.toFixed(2)}`}</p>
      </div>
    </div>
  );
}

export default PredictionPanel;
