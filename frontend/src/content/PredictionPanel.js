import { useState, useEffect, useRef } from "react";
import socket from "../scripts/serverConnection";

function PredictionPanel(props) {
  const [prediction, setPrediction] = useState({});
  const [style, setStyle] = useState({ opacity: "0%" });
  const timer = useRef();

  useEffect(() => {
    socket.on("prediction", (p) => {
      console.log("Received prediction " + p);
      setPrediction(p);
      setStyle({ opacity: "100%" });
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        setStyle({ opacity: "0%", transition: "opacity 2s" });
      }, 2500);
    });
  }, [setPrediction, setStyle]);

  const predictionText = Object.entries(prediction).map(([key, value]) => (
    <p key={key}>
      {Math.round(value * 100)}% {key}
    </p>
  ));

  return (
    <>
      <h2>The system thinks that your sketch is:</h2>
      {predictionText}
    </>
  );
}

export default PredictionPanel;
