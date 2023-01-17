import React from "react";
import FMSynth from "../scripts/fm_synth";
import { PlayArrow, Pause } from "@material-ui/icons";
import "../json/noisy_annotations.json";

class SynthWrapper extends React.PureComponent {
  constructor(props) {
    super(props);
    this.note = props.note || 48;
    this.parameters = props.parameters;
    this.state = { loaded: false, playing: props.autoplay };
    this.prevPlayState = React.createRef(false);
    this.handlePlay = this.handlePlay.bind(this);
    this.handleKeyInput = this.handleKeyInput.bind(this);
  }

  componentDidMount() {
    // Create audio context and load FM Synth
    // Cross-browser friendly way of starting AudioContext
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.synth = new FMSynth(this.audioContext);
    this.synth.initialize().then(() => {
      console.log("Loaded Synth");
      this.setState({ loaded: true });
      if (this.parameters) {
        this.synth.setAllParams(this.parameters);
      }
    });
    // Add event listener to control playback with s key
    document.addEventListener("keydown", this.handleKeyInput);
  }

  handlePlay() {
    // Toggle play state
    this.setState({ playing: !this.state.playing });
  }

  handleKeyInput(e) {
    if (e.key === "s") {
      this.handlePlay();
    }
  }

  // socket.on('synth id',(synthId) => this.synth.setAllParams(synthInfo[synthId]));

  componentDidUpdate() {
    // Get new props
    if (!this.state.loaded) {
      console.log("wait for FMSynth to finish initializing.")
    }
    else {
      this.synth.setAllParams(this.props.parameters);
      // Play or pause audio depending on state
      if (this.audioContext.state !== "running") {
        this.audioContext.resume();
      }
      if (this.state.playing && !this.prevPlayState) {
        this.synth.startNote(this.note);
      } else if (!this.state.playing) {
        this.synth.endNote();
          }
      this.prevPlayState = this.state.playing;
    }
    

  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyInput);
    this.audioContext.close().then(() => {
      console.log("Audiocontext closed");
    });
  }

  render() {
    return (
      <div>
        <button onClick={this.handlePlay}>
          {this.state.playing ? (
            <Pause fontSize="large" />
          ) : (
            <PlayArrow fontSize="large" />
          )}
        </button>
      </div>
    );
  }
}

export default SynthWrapper;
