import { v4 as uuidv4 } from "uuid";
// Import page templates
import TextPage from "../pages/TextPage";
import DrawingInterface from "../pages/DrawingInterface";
// import PopupSurvey from "./pages/PopupSurvey";
import Survey from "../pages/Survey";
import Submission from "../pages/Submission";

import {
  browserName,
  browserVersion,
  isMacOs,
  isWindows,
} from "react-device-detect";

// Import content for pages
import participantInformation from "../content/participantInformation";
import consentForm from "../content/consentForm";
import instructions from "../content/instructions";
import personalSurvey from "../content/personalSurvey";

// Determine whether participant will get the model prediction or random selection
const mode = Math.random() < 0.5 ? "prediction" : "random";

// Create pages based on descriptors
const getPageArray = (descriptors) => {
  const pageArray = [];

  // Add starting pages to page array
  [participantInformation, consentForm, instructions].forEach((page, i) => {
    pageArray.push({
      component: TextPage,
      props: {
        heading: <h1>Sketch Synth</h1>,
        content: page.content,
        validationFunction: page.validation,
        key: `textPage${i + 1}`,
      },
    });
  });

  // Create pages for main study
  descriptors.forEach((descriptor, i) => {
    pageArray.push({
      component: DrawingInterface,
      props: {
        rdp: 2,
        minLength: 20,
        maxLength: 150,
        parameters: {},
        note: 42,
        autoplay: false,
        instructions: descriptor,
        key: `drawingInterface_${i}`,
      },
    });
  });

  // Add survey
  pageArray.push({
    component: Survey,
    props: {
      heading: <h1>Sketch Synth</h1>,
      content: personalSurvey.content,
      key: "personalSurvey",
    },
  });

  // Add last page
  pageArray.push({
    component: Submission,
    props: {
      heading: <h1>Sketch Synth</h1>,
      content: (
        <>
          <h2>Success!</h2>
          <p>
            In this study, you were presented with{" "}
            {mode === "prediction"
              ? "the functioning system"
              : "a random selection of sounds"}
            . Half of the participants are shown a random selection of sounds
            rather than the functioning system. Because we don’t know how people
            will rate a random sound selection, this is necessary to assess how
            well the system performs against a random baseline.
          </p>
          <p>
            Thank you for your participation, your data will help us to improve
            this synthesiser system and will enable us to soon release a
            functioning prototype for everyone to explore.
          </p>
        </>
      ),
      key: "Submission",
    },
  });

  return pageArray;
};

// create user id
const USER_ID = uuidv4();

// Get info about participant setup (Date, OS, browser, screensize, mode)
const currentDate = new Date();
const getOs = () => {
  if (isMacOs) return "Mac";
  if (isWindows) return "Windows";
  return "Unknown";
};
const setup = {
  date: currentDate.toDateString(),
  os: getOs(),
  browser: `${browserName} ${browserVersion}`,
  screenSize: { w: window.screen.width, h: window.screen.height },
  mode: mode,
};

export { USER_ID, setup, mode, getPageArray };
