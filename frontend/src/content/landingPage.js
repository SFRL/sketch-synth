import {
  CheckCircleOutline,
  Block,
  Laptop,
  Smartphone,
  Tablet,
  Computer,
  CallToAction,
  Mouse,
  TouchApp,
  Headset,
  Speaker,
} from "@material-ui/icons";
import { isMobile, isChrome } from "react-device-detect";
import chromeLogo from "../img/chrome-logo.svg";

const html = (
  <>
    <h2>Welcome to the Sketch Synth study</h2>
    <p>Thank you for showing interest in this study!</p>
    <p>
      Please be aware that you should complete this study on a{" "}
      <strong>laptop or desktop</strong> computer and{" "}
      <strong>not on a mobile device</strong> like a tablet or phone.
    </p>
    <p>
      <Laptop style={{ fontSize: 60, marginLeft: "1rem" }} />
      <CheckCircleOutline fontSize={"small"} style={{ color: "green" }} />
      <Computer style={{ fontSize: 60, marginLeft: "1rem" }} />
      <CheckCircleOutline fontSize={"small"} style={{ color: "green" }} />
      <Smartphone style={{ fontSize: 60, marginLeft: "1rem" }} />
      <Block fontSize={"small"} style={{ color: "red" }} />
      <Tablet style={{ fontSize: 60, marginLeft: "1rem" }} />
      <Block fontSize={"small"} style={{ color: "red" }} />
    </p>
    <p>
      If possible, use the integrated trackpad of your laptop or a computer
      mouse rather than a touchscreen or other specialised control devices.
    </p>
    <p>
      <CallToAction style={{ fontSize: 60, marginLeft: "1rem" }} />
      <CheckCircleOutline fontSize={"small"} style={{ color: "green" }} />
      <Mouse style={{ fontSize: 60, marginLeft: "1rem" }} />
      <CheckCircleOutline fontSize={"small"} style={{ color: "green" }} />
      <TouchApp style={{ fontSize: 60, marginLeft: "1rem" }} />
      <Block fontSize={"small"} style={{ color: "red" }} />
    </p>
    <p>
      {" "}
      This study involves sound. Please make sure that you are able to listen to
      audio either through headphones or speakers. Also, for your own safety,
      start with a low volume level.
    </p>
    <p>
      <Headset style={{ fontSize: 60, marginLeft: "1rem" }} />
      <CheckCircleOutline fontSize={"small"} style={{ color: "green" }} />
      <Speaker style={{ fontSize: 60, marginLeft: "1rem" }} />
      <CheckCircleOutline fontSize={"small"} style={{ color: "green" }} />
    </p>
    <p>
      This study was developed to run in <strong>Google Chrome</strong>. There
      is no guarantee that it will work properly in other browsers.
    </p>
    <p>
      <img
        src={chromeLogo}
        alt="Google Chrome Logo"
        style={{ marginLeft: "1rem" }}
      />
      <CheckCircleOutline fontSize={"small"} style={{ color: "green" }} />
    </p>
  </>
);

// Make participants double aware that mobile devices should not be used
// and that Chrome is the preferred browser.
const validationFunction = () => {
  if (isMobile) {
    alert(
      "It seems like you are accessing this page through a mobile device. If this is the case, please change to a laptop or desktop computer before proceeding."
    );
  } else if (!isChrome) {
    alert(
      "It looks like you are using a different browser than Chrome. If possible, please change to Chrome because the study might not work properly otherwise."
    );
  }
  return true;
};

const exportContent = { content: html, validation: validationFunction };
export default exportContent;
