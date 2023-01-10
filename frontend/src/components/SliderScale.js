import { useState } from "react";
import "../css/sliderScale.css";

const SliderScale = ({ name, min, max, start }) => {
  const [sliderValue, setSliderValue] = useState("");
  return (
    <>
      <input
        required
        type="range"
        className="slider"
        name={name || "slider"}
        min={min || 0}
        max={max || 100}
        value={sliderValue}
        onChange={(e) => setSliderValue(e.target.value)}
      ></input>
      <label className="slider">
        <span>{min || 0}</span>{" "}
        <span>
          Current value:{" "}
          <input
            required
            type="number"
            min={min || 0}
            max={max || 100}
            value={sliderValue}
            onChange={(e) => setSliderValue(e.target.value)}
          ></input>
        </span>{" "}
        <span>{max || 100}</span>
      </label>
    </>
  );
};

export default SliderScale;
