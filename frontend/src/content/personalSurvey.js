const html = (
  <>
    <h2>Survey</h2>
    <p>
      Almost done! Please fill in the following survey and submit your data.
    </p>

    <h3>1. Personal Information</h3>
    <label htmlFor="age">
      1.1 Age in years<sup>*</sup>
    </label>
    <input type="text" name="age" className="surveyElement" required />

    <label htmlFor="gender">
      1.2 Gender<sup>*</sup>
    </label>
    <select name="gender" className="surveyElement" required>
      <option value="">Please select</option>
      <option value="female">Female</option>
      <option value="male">Male</option>
      <option value="other">Other/Non-binary</option>
      <option value="prefernottosay">Prefer not to say</option>
    </select>

    <label htmlFor="occupation">
      1.3 Occupation (if student please specify field of study)<sup>*</sup>
    </label>
    <input type="text" name="occupation" className="surveyElement" required />

    <label htmlFor="visual_impairement">
      1.4 Do you have a visual impairment?<sup>*</sup>
    </label>
    <ul className="vertical surveyElement">
      <li>
        <input type="radio" name="visual_impairement" value="0" required />
        No
      </li>
      <li>
        <input type="radio" name="visual_impairement" value="1" />
        Yes - please specify{" "}
        <input type="text" name="visual_impairement_specify" />
      </li>
    </ul>

    <label htmlFor="auditory_impairement">
      1.5 Do you have a auditory impairment?<sup>*</sup>
    </label>
    <ul className="vertical surveyElement">
      <li>
        <input type="radio" name="auditory_impairement" value="0" required />
        No
      </li>
      <li>
        <input type="radio" name="auditory_impairement" value="1" />
        Yes - please specify{" "}
        <input type="text" name="auditory_impairement_specify" />
      </li>
    </ul>

    <h3>2. Musical experience</h3>
    <label htmlFor="music_making">
      2.1 How often are you actively engaged in musical activity (e.g. playing
      an instrument, DJing or producing music in a DAW)<sup>*</sup>
    </label>
    <select name="music_making" className="surveyElement" required>
      <option value="">Please select</option>
      <option value="1">Never</option>
      <option value="2">Once a year or less</option>
      <option value="3">Multiple times a year</option>
      <option value="4">Once a month</option>
      <option value="5">Multiple times per month</option>
      <option value="6">Once a week</option>
      <option value="7">Multiple times per week</option>
      <option value="8">Every Day</option>
    </select>

    <label htmlFor="music_consuming">
      2.2 How long do you actively listen to music every day?<sup>*</sup>
    </label>
    <select name="music_consuming" className="surveyElement" required>
      <option value="">Please select</option>
      <option value="0">0-15min</option>
      <option value="1">15-30min</option>
      <option value="2">30-60min</option>
      <option value="3">60-90min</option>
      <option value="4">2h</option>
      <option value="5">2-3h</option>
      <option value="6">4h+</option>
    </select>

    <label htmlFor="music_education">
      2.3 How many years of formal training in a musical discipline (musical
      instrument including voice or music theory including music informatics)
      did you have during your lifetime?<sup>*</sup>
    </label>
    <select name="music_education" className="surveyElement" required>
      <option value="">Please select</option>
      <option value="0">0 years</option>
      <option value="1">0.5 years</option>
      <option value="2">1 year</option>
      <option value="3">2 years</option>
      <option value="4">3-5 years</option>
      <option value="5">6-9 years</option>
      <option value="6">10+ years</option>
    </select>

    <h3>3. Visual art/design experience</h3>

    <label htmlFor="art_making">
      3.1 In an average week how many hours do you spend creating visual art
      (this includes anything from painting or illustrating to graphic design)
      <sup>*</sup>
    </label>
    <select name="art_making" className="surveyElement" required>
      <option value="">Please select</option>
      <option value="0">0 hours</option>
      <option value="1">1 hour</option>
      <option value="2">2 hours</option>
      <option value="3">3 hours</option>
      <option value="4">4 hours</option>
      <option value="5">5 hours</option>
      <option value="6">6+ hours</option>
    </select>

    <label htmlFor="art_consuming">
      3.2 On average how often do you engage with visual art or design either by
      visiting exhibitions at museums/galleries or by reading publications
      specific to that field?<sup>*</sup>{" "}
    </label>
    <select name="art_consuming" className="surveyElement" required>
      <option value="">Please select</option>
      <option value="0">Never</option>
      <option value="1">Once a year or less</option>
      <option value="2">Multiple times a year</option>
      <option value="3">Once a month</option>
      <option value="4">Multiple times per month</option>
      <option value="5">Once a week</option>
      <option value="6">Multiple times per week</option>
      <option value="7">Every Day</option>
    </select>

    <label htmlFor="art_education">
      3.3 How many years of formal training in a visual art/design discipline
      (either practical like studio art, illustration, graphic design or
      theoretical like art history, art theory) did you have during your
      lifetime?<sup>*</sup>{" "}
    </label>
    <select name="art_education" className="surveyElement" required>
      <option value="">Please select</option>
      <option value="0">0 years</option>
      <option value="1">0.5 years</option>
      <option value="2">1 year</option>
      <option value="3">2 years</option>
      <option value="4">3-5 years</option>
      <option value="5">6-9 years</option>
      <option value="6">10+ years</option>
    </select>

    <h3>4. Hardware</h3>
    <label htmlFor="device">
      4.1 What type of device are you using to participate in this study. Please
      remember that mobile devices (phones, tablets, etc.) are not allowed for
      this study.<sup>*</sup>
    </label>
    <ul className="vertical surveyElement">
      <li>
        <input type="radio" name="device" value="1" required />
        Laptop / MacBook
      </li>
      <li>
        <input type="radio" name="device" value="2" />
        Desktop Computer
      </li>
      <li>
        <input type="radio" name="device" value="3" />
        Other - please specify <input type="text" name="device_specify" />
      </li>
    </ul>

    <label htmlFor="input">
      4.2 What device do you use to control the mouse cursor?<sup>*</sup>
    </label>
    <ul className="vertical surveyElement">
      <li>
        <input type="radio" name="input" value="1" required />
        Trackpad integrated in laptop/MacBook
      </li>
      <li>
        <input type="radio" name="input" value="2" />
        Computer mouse
      </li>
      <li>
        <input type="radio" name="input" value="3" />
        Specialised input e.g. graphics tablet or touchscreen - please specify{" "}
        <input type="text" name="input_specify" />
      </li>
    </ul>

    <label htmlFor="audio">
      4.3 How did you listen to audio for this study?<sup>*</sup>
    </label>
    <ul className="vertical surveyElement">
      <li>
        <input type="radio" name="audio" value="1" required />
        In-ear earphones (e.g. Apple iPods)
      </li>
      <li>
        <input type="radio" name="audio" value="2" />
        Over-ear headphones (e.g. Beats)
      </li>
      <li>
        <input type="radio" name="audio" value="3" />
        Integrated speakers (e.g. laptop speakers)
      </li>
      <li>
        <input type="radio" name="audio" value="4" />
        External speakers (e.g. hi-fi sound system)
      </li>
      <li>
        <input type="radio" name="audio" value="5" />
        Other - please specify <input type="text" name="audio_specify" />
      </li>
    </ul>
    <h3>5. Study Feedback</h3>
    <label htmlFor="q1">
      5.1 I thought that this system produced suitable sounds from my sketches.
      <sup>*</sup>
    </label>
    <ul className="horizontal surveyElement">
      <li> Strongly Disagree </li>
      <li>
        <input type="radio" name="q1" value="1" required />
      </li>
      <li>
        <input type="radio" name="q1" value="2" />
      </li>
      <li>
        <input type="radio" name="q1" value="3" />
      </li>
      <li>
        <input type="radio" name="q1" value="4" />
      </li>
      <li>
        <input type="radio" name="q1" value="5" />
      </li>
      <li> Strongly Agree </li>
    </ul>
    <label htmlFor="feedback">
      5.2 Please add any additional feedback that you might have.
    </label>
    <textarea
      name="feedback"
      rows="7"
      cols="33"
      placeholder="Type here..."
      className="surveyElement"
    ></textarea>
  </>
);

const exportContent = { content: html, validation: false };
export default exportContent;
