import SliderScale from "../components/SliderScale";

function Survey(props) {
  const submitFormData = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const value = parseInt(Object.fromEntries(data.entries())["slider"]);
    if (props.callback) {
      props.callback(value);
    }
  };

  return (
    <>
      <ol>
        <li>
          <b> Listen to the sound that was recommended from your sketch.</b>
        </li>
      </ol>
      {props.audioElement}
      <ol start="2">
        <li>
          Give a rating for how well you think the sound matches your sketch.
        </li>
      </ol>
      <form name="survey" onSubmit={(e) => submitFormData(e)}>
        <SliderScale />
        <button type="submit" value="Submit">
          Next
        </button>
      </form>
    </>
  );
}

export default Survey;
