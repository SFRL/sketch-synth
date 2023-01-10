import { useState } from "react";

const SoundDescriptorState = (props) => {
  const [noisiness, setNoisiness] = useState(2 * props.noiseChange);
  
};

export default SoundDescriptorState;
