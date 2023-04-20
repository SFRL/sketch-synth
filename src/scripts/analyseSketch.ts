import {
  createSketchImage,
  preprocessSketch,
  makeSoundSketchPrediction,
  makeSketchFeaturePrediction,
  calculateBoundingBox
} from "./tensorflowModel";

import { Sketch } from "./sketchClasses";

const analyseSketch = async (sketch:Sketch,sketchCanvas:HTMLCanvasElement|null=null,sliceCanvas:HTMLCanvasElement|null=null) => {
  // Make sound-sketch prediction from the whole sketch 
  const [x,y,l,h] = sketch.getBoundingBox();
  const canvasSlice = createSketchImage(sketch.strokes,x,y,l,h,100,100);
  const processedSketchImg = preprocessSketch(canvasSlice, sketchCanvas);
  const [noisy, thin] = await makeSoundSketchPrediction(processedSketchImg);

  // Make sketch feature prediction from last n points: 
  // get current slice
  const currentSlice = sketch.getCurrentSlice(15)
  const [xSlice, ySlice, lSlice, hSlice] = calculateBoundingBox([
    currentSlice,
  ]);
  const canvasOfSlice = createSketchImage(
    [currentSlice],
    xSlice,
    ySlice,
    lSlice,
    hSlice,
    100,
    100
  );
  const processedSliceImg = preprocessSketch(canvasOfSlice, sliceCanvas);

  const feature = currentSlice.x.length>0?await makeSketchFeaturePrediction(processedSliceImg):{"probability":0,"category":"None"}

  // Update feature categories for stroke
  const stroke = currentSlice.stroke;
  currentSlice.indices.forEach((i) => {
    stroke.updateFeatureCategory(feature,i);
  });

  const speed = sketch.getCurrentSpeed(3, true);
  const centerX = (x + 0.5*l)/sketch.width;
  const centerY = 1-(y + 0.5*h)/sketch.height;
  const width = l/sketch.width;
  const height = h/sketch.height;
  return { 
    noisy: noisy, 
    thin: thin, 
    feature: feature.category, 
    speed: speed, 
    centerX: centerX, 
    centerY: centerY, 
    width: width, 
    height: height, 
    strokes: sketch.length, 
    length: sketch.totalStrokeLength};
}

export {analyseSketch}