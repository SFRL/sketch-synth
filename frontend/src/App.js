import React, { useState, useCallback, useEffect } from "react";
import Layout from "./components/Layout";
import landingPage from "./content/landingPage";
import DrawingInterface from "./pages/DrawingInterface";
import { Loop } from "@material-ui/icons";

import "./css/loading.css";
import "./css/layout.css";
import "./css/button.css";
import "./App.css";

// Import page templates
// import socket from "./scripts/serverConnection";
// import { USER_ID, setup, getPageArray } from "./scripts/init";
// import APIService from "./scripts/APIService";
// import shuffleArray from "./scripts/shuffle";

import { loadModel } from "./scripts/tensorflowModel";

// let pageArray = [];

function App() {
  const [loaded, setLoaded] = useState(false);

  // Get descriptors from server and generate study pages
  // Then Submit metadata when app is mounted
  useEffect(() => {
    if (!loaded) {
      loadModel()
        .then((model) => {
          setLoaded(true);
          console.log("Model loaded");
        })
        .catch((error) => console.log("Could not load model"));
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
