import React, { useState, useEffect, useRef } from "react";
import SketchSynthInterface from "./SketchSynthInterface";
import { CookiesProvider, useCookies } from "react-cookie";

import "./css/body.css";
import "./css/welcomescreen.css";

import { loadModel } from "./scripts/tensorflowModel";

const App = () => {
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  
  // Get the ip of the OSC receiver from user input
  const ipInputRef = useRef(null);
  // Use cookies to remember ip
  const [ipCookie, setIpCookie] = useCookies(['hostIp']);
  const [oscHost, setOscHost] = useState(ipCookie.hostIp || "localhost");

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

  useEffect(()=>console.log(oscHost))

  const startInterface = () => {
    const ip = ipInputRef.current?.value || "localhost";
    setIpCookie('hostIp', ip, {path: '/'});
    setOscHost(ip);
    setStarted(true);
  }

  const welcomeScreen = (
    <section className="welcome">
      <div>
        <h1>Welcome to SketchSynth</h1>
        <p>Please enter the IP address of your OSC receiver</p>
        <p>
          <input
            ref={ipInputRef}
            type="text"
            value={oscHost}
            onChange={(e) => setOscHost(e.target.value)}
          ></input>
          {/* <input type="checkbox"></input>Remember host */}
        </p>

        {!loaded ? (
          <p>SketchSynth is loading...</p>
        ) : (
          <button onClick={startInterface}>Start</button>
        )}
      </div>
    </section>
  );


  const show = !started ? (
    welcomeScreen
  ) : (
    <SketchSynthInterface
      rdp={2}
      minLength={20}
      maxLength={150}
      note={42}
      autoplay={false}
      instructions={""}
      key={"drawingInterface"}
      oscHost={oscHost}
    />
  );
  return <CookiesProvider>{show}</CookiesProvider>;
}

export default App;
