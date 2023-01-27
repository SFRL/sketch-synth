import React, { useState, useEffect } from "react";
import DrawingInterface from "./pages/DrawingInterface";

import "./css/body.css";
import "./App.css";

import { loadModel } from "./scripts/tensorflowModel";

function App() {
  const [loaded, setLoaded] = useState(false);

  // Get descriptors from server and generate study pages
  // Then Submit metadata when app is mounted
  useEffect(() => {
    if (!loaded) {
      loadModel()
        .then((hasLoaded) => {
          if (hasLoaded) {
            setLoaded(true);
            console.log("Model loaded");
          }
          else {
            alert("Something went wrong. Could not load model."); 
          }
        })
        .catch((error) => console.log("Could not load model."));
    }
  }, [loaded, setLoaded]);
  const show = !loaded ? (
    <p>Load model</p>
  ) : (
    <DrawingInterface
      rdp={2}
      minLength={20}
      maxLength={150}
      note={42}
      autoplay={false}
      instructions={""}
      key={"drawingInterface"}
    />
  );
  return <>{show}</>;
}

export default App;
