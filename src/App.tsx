import React, { useState, useEffect, useRef } from "react";
import SketchSynthInterface from "./SketchSynthInterface";
import { CookiesProvider, useCookies } from "react-cookie";
import { ExperimentSynth } from "./scripts/wavetableSynth";

import "./css/body.css";
import "./css/welcomescreen.css";

import { loadModel } from "./scripts/tensorflowModel";

const setupSynth = async () => {
      const synthResources = await ExperimentSynth.loadResources(
      "waveshaper_grid.npy",
      "audio/ir.wav"
    );
    const synth = new ExperimentSynth(
      synthResources.lookupTable,
      synthResources.impulseResponse
    );
    await synth.initialiseSynth();
    return synth;
    }

const App = () => {
  const [loaded, setLoaded] = useState(false);
  const [loadSynth, setLoadSynth] = useState(false);
  const [synth, setSynth] = useState<ExperimentSynth | null>(null);
  const [started, setStarted] = useState(false);
  
  // Get the ip of the OSC receiver from user input
  const ipInputRef = useRef<HTMLInputElement>(null);
  // Use cookies to remember ip
  const [ipCookie, setIpCookie] = useCookies(['hostIp']);
  const [https,setHttps] = useState(window.location.protocol === "https:");
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
        })
        .catch((error) => console.log("Could not load model."));
    }
  }, [loaded, setLoaded]);

  useEffect(() => {
    if (loadSynth) {
      setupSynth().then((synth) => {
        setSynth(synth)
        setStarted(true);
      })
    }
    setLoadSynth(false);
  },[loadSynth,synth,setSynth,setStarted]);



  const startInterface = () => {
    const ip = ipInputRef.current?.value || "localhost";
    setIpCookie('hostIp', ip, {path: '/'});
    setOscHost(ip);
    setLoadSynth(true);
  }

    useEffect(()=>{
    console.log(https);
    console.log(window.location.protocol);   
    console.log(oscHost)
  })

  const welcomeScreen = (
    <section className="welcome">
      <div>
        <h1>Welcome to SketchSynth</h1>
        {https ? (
          <p>
            <strong>WARNING:</strong> OSC connection inside a local network is
            not currently supported for HTTPS. Please go to{" "}
            <a href="http://sketchsynth.com">http://sketchsynth.com</a> instead.
            Please note that some browsers automatically redirect to HTTPS, we
            found that HTTP works well on Safari.
          </p>
        ) : undefined}
        <p>
          You can connect the SketchSynth to an Digital Audio Workstation (DAW)
          via OSC. For Ableton Live you can download a OSC receiver Max4Live
          patch{" "}
          <a
            href="https://drive.google.com/file/d/1Emau3V3s_01kmxYld6IX5TofY7Ff4XhJ/view?usp=share_link"
            target="_blank"
            rel="noopener noreferrer"
          >
            here{" "}
          </a>
          . You can watch a demonstration of SketchSynth on{" "}
          <a
            href="https://youtu.be/arSFt3iBAUM"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>
          .
        </p>
        <p>
          Please enter the local network IP address of the machine that runs
          your OSC receiver.
        </p>
        <p>
          <input
            ref={ipInputRef}
            type="text"
            value={oscHost}
            onChange={(e) => setOscHost(e.target.value)}
          ></input>
        </p>

        {!loaded ? (
          <p>SketchSynth is loading...</p>
        ) : (
          <button onClick={startInterface}>{loadSynth?"Wait for synth to load":"Start"}</button>
        )}
      </div>
    </section>
  );


  const show = !started ? (
    welcomeScreen
  ) : (
    <SketchSynthInterface
      instructions={""}
      synth={synth}
      oscHost={oscHost}
      https={https}
    />
  );
  return <CookiesProvider>{show}</CookiesProvider>;
}

export default App;
