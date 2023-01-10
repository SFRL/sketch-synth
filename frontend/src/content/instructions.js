import AudioPlayer from "../components/AudioPlayer";
import whitenoise from "../audio/whitenoise.mp3";
import abstract from "../img/abstract.png";
import figurative from "../img/figurative.png";
import { CheckCircleOutline, Block } from "@material-ui/icons";

const minWidth = 800;
const minHeight = 600;

const html = (
  <>
    <h2>How does the study work?</h2>
    <p>
      You are about to start the study now, but before, please have a look at
      the following information.
    </p>
    <h3>1. Procedure</h3>
    <p>
      You will be presented with a <strong>drawing interface</strong> and a
      series of{" "}
      <strong>6 adjectives (e.g. large, small, smooth, metallic etc.) </strong>{" "}
      that describe a sound. Your task will be to imagine what that sound would
      sound like and <strong>draw a representation of it</strong>. You can draw
      whatever you feel represents the sounds best, but we encourage{" "}
      <strong>abstract rather than figurative drawings</strong>. Have a look at
      these examples for reference:
    </p>
    <div className="indented">
      <figure>
        <img
          src={abstract}
          alt="Example of an abstract drawing"
          style={{ width: "200px" }}
        />
        <figcaption> Keep your drawings abstract! </figcaption>
      </figure>
      <CheckCircleOutline fontSize={"medium"} style={{ color: "green" }} />
      {/* Add a vertical line between the examples */}
      <div
        style={{
          display: "inline-block",
          height: "200px",
          border: "1px solid black",
          margin: "0 3rem",
        }}
      ></div>
      <figure>
        <img
          src={figurative}
          alt="Example of a figurative drawing"
          style={{ width: "200px" }}
        />
        <figcaption>No figurative drawings, please!</figcaption>
      </figure>
      <Block fontSize={"medium"} style={{ color: "red" }} />
    </div>
    <p>
      <strong>
        There is no time limit, but try to complete a sketch within 30 seconds.
      </strong>
      <br />
    </p>
    <p>
      Once you are done drawing, click <strong>Submit</strong> and a sound
      suggestion will appear in a popup window. You will be asked to{" "}
      <strong>rate how well the sound matches your drawing</strong> before
      proceeding to the next stage.
    </p>
    <p>
      {" "}
      After completing the task, you will be asked to fill in a short
      questionnaire about your experience and basic personal information.
    </p>

    <h3>2. Drawing interface</h3>
    <p>
      The drawing interface allows you to draw with your mouse or trackpad in
      the browser window and gives you the option to reset the task if you are
      unhappy with your drawing. The{" "}
      <strong>total length of your drawing is limited</strong>. If you reach the
      maximum, the beginning of your drawing will start to be erased. In the
      next step, you will have the chance to test the interface.
    </p>

    <h3>3. Audio Playback</h3>
    <div className="alert">
      The following sound is <strong>LOUD!!!</strong> It is important to{" "}
      <strong>START WITH A LOW VOLUME!!!</strong>
    </div>
    <p>
      {" "}
      Please listen to the audio file below and adjust your volume to a
      comfortable level. Keep the same volume throughout the study. You can
      either{" "}
      <strong>click the button or use the "s" key to start/stop audio.</strong>
    </p>
    <p className="indented">
      <AudioPlayer autoplay={false} src={whitenoise} />
    </p>

    <h3>4. Browser window size</h3>
    <p>
      Please ensure that your browser window size is{" "}
      <strong>
        at least {minWidth}&times;
        {minHeight} pixels
      </strong>
      . If possible, keep the same window size throughout the study. Be advised
      that if you adjust the window size during a task, your sketch will be
      erased.
    </p>
  </>
);

const validatationFunction = () => {
  if (window.innerWidth >= minWidth && window.innerHeight >= minHeight) {
    return true;
  } else {
    alert(
      `Your browser window is ${window.innerWidth} pixels wide and ${window.innerHeight} pixel high. Please increase the size to continue.`
    );
    return false;
  }
};

const exportContent = { content: html, validation: validatationFunction };
export default exportContent;
