import * as tf from "@tensorflow/tfjs";
// const os = require('os');


// import { norm } from "@tensorflow/tfjs";
// import { mode } from "./init";

// The prediction model
let model;

const loadModel = async () => {
    // const networkInterfaces = os.networkInterfaces();
    // const ip = networkInterfaces["eth0"][0]["address"];
    await tf
    .loadLayersModel(`http://localhost:5500/model/model.json`)
    .then((result) => {
      model = result
    })
    .catch((error) => {
      console.log(error)
    });

    return model?true:false
};

const getSketchBoundingBox = (strokes, canvasWidth, canvasHeight) => {
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

  return [minX,minY,Math.max(maxX - minX,0),Math.max(maxY - minY,0)]
}

// Get bounding box of sketch, cut sketch from canvas and rescale to fit cnn input
const extractSketch = (canvas, x, y, l, h) => {
  // console.log(canvas);
  return canvas.drawingContext.getImageData( x, y, l, h)

};

const preprocessSketch = (imgData, returnCanvas, invert = false) => {
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
    if (invert) normalized = tf.scalar(1.0).sub(normalized);
    // Only allow 0 and 1, faded colours are counted as 1 until they fully disappeared
    normalized = normalized.ceil();
    //We add a dimension to get a batch shape
    const batched = normalized.expandDims(0);

    // Display extracted, processed image on prediction panel canvas
    returnCanvas.width = normalized.shape.width;
    returnCanvas.height = normalized.shape.height;
    tf.browser.toPixels(normalized, returnCanvas);

    return batched;
  });
};

const rescale = (c,offset,scale) => (c-offset)*scale;

const createSketchImage = (strokes,x,y,l,h,dimX=28,dimY=28) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  // Black background
  ctx.fillRect(0,0,dimX,dimY);
  
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "white";

  const scaler = Math.max(l,h)
  const xScale = dimX/scaler;
  const yScale = dimY/scaler;

  strokes.forEach((stroke)=> {
      const X = stroke.x;
      const Y = stroke.y;

      ctx.beginPath()
      ctx.moveTo(rescale(X[0],x,xScale),rescale(Y[0],y,yScale))

      for (let i=0; i<X.length; i++) {
        ctx.lineTo(rescale(X[i], x, xScale), rescale(Y[i], y, yScale));
      }
      // ctx.endPath();
      ctx.stroke();
  })

  const imgData = ctx.getImageData(0,0,dimX,dimY);

  return imgData
}

// Make prediction
const makePrediction = async (preprocessed) => {
  const [out1,out2] = model.predict(preprocessed);
  const noisyCalm = await out1.data();
  const thinThick = await out2.data(); 
  return [noisyCalm[0],thinThick[0]];
};

export { loadModel, makePrediction, getSketchBoundingBox, extractSketch, createSketchImage, preprocessSketch };
