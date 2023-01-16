import * as tf from "@tensorflow/tfjs";
import { norm } from "@tensorflow/tfjs";
// import { mode } from "./init";

// The prediction model
let model;

const loadModel = async () => {
  const result = await tf
    .loadLayersModel("http://localhost:5500/model/model.json")
    .then((result) => (model = result))
    .catch((error) => console.log(error));
};

// Get bounding box of sketch, cut sketch from canvas and rescale to fit cnn input
const extractSketch = (canvas, strokes, canvasWidth, canvasHeight) => {
  // Get bounding box dimensions of sketch
  let maxX = 0;
  let maxY = 0;
  let minX = canvasWidth;
  let minY = canvasHeight;
  strokes.forEach((stroke) => {
    maxX = Math.max(maxX, Math.max(...stroke.x));
    maxY = Math.max(maxY, Math.max(...stroke.y));
    minX = Math.min(minX, Math.min(...stroke.x));
    minY = Math.min(minY, Math.min(...stroke.y));
  });
  // console.log(`x=(${minX}, ${maxX})\ny=(${minY}, ${maxY})`);
  const imgData = canvas.drawingContext.getImageData(
    minX,
    minY,
    maxX - minX,
    maxY - minY
  );

  return imgData;
};

const preprocess = (imgData, returnCanvas) => {
  return tf.tidy(() => {
    //convert the image data to a tensor
    let tensor = tf.browser.fromPixels(imgData, 1);
    const shape = tensor.shape;

    const diff = shape[0] - shape[1];

    // Pad image to square dimensions
    if (shape[0] > shape[1]) {
      tensor = tensor.pad(
        [
          [0, 0],
          [0, diff],
          [0, 0],
        ],
        255
      );
    } else {
      const diff = shape[1] - shape[0];
      tensor = tensor.pad(
        [
          [0, diff],
          [0, 0],
          [0, 0],
        ],
        255
      );
    }

    //resize to 28 x 28
    const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat();

    // Normalize the image
    let normalized = resized.div(255.0);
    // Invert colours, so background is black (0) and strokes white (1)
    normalized = tf.scalar(1.0).sub(normalized);
    // Only allow 0 and 1, faded colours are counted as 1 until they fully disappeared
    normalized = normalized.ceil();
    //We add a dimension to get a batch shape
    const batched = normalized.expandDims(0);

    // normalized.array().then((array) => console.log(array));

    // Display extracted, processed image on prediction panel canvas
    returnCanvas.width = normalized.shape.width;
    returnCanvas.height = normalized.shape.height;
    tf.browser.toPixels(normalized, returnCanvas);

    return batched;
  });
};

// Make prediction
const makePrediction = async (sketch, returnCanvas) => {
  const getSum = (total, sketch) => total + sketch.length;
  const totalStrokeLength = sketch.strokes.reduce(getSum, 0);
  if (totalStrokeLength < 30) return [0.5, 0.5];

  const imgData = extractSketch(
    sketch.canvas,
    sketch.strokes,
    sketch.width,
    sketch.height
  );
  const preprocessed = preprocess(imgData, returnCanvas);

  // const firsttime = Date.now();

  const [out1,out2] = model.predict(preprocessed);
  const noisyCalm = await out1.data();
  const thinThick = await out2.data(); 

  // console.log(`Time difference is: ${Date.now() - firsttime}`);
  // .then((result) => result.value)
  // .catch((error) => console.log(error));

  return [noisyCalm[0],thinThick[0]];
};

export { loadModel, makePrediction };
