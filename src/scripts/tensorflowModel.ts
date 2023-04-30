import * as tf from "@tensorflow/tfjs";
import {Stroke,StrokeSlice,Feature} from "./sketchClasses";

// The prediction models
let soundSketchClassifier : tf.LayersModel; 
let sketchFeatureClassifier : tf.LayersModel;

const loadModel = async () => {
    await tf
      .loadLayersModel("http://localhost:5500/public/sound_sketch_classifier/model.json")
      .then((result) => {
        soundSketchClassifier = result;
      })
      .catch((error) => {
        alert(`Could not load Sound Sketch model with error: ${error}`);
      });
    
    await tf
      .loadLayersModel( "http://localhost:5500/public/sketch_feature_classifier/model.json")
      .then((result) => {
        sketchFeatureClassifier = result;
      })
      .catch((error) => {
        alert(`Could not load Sketch Feature model with error: ${error}`);
      });

    return soundSketchClassifier && sketchFeatureClassifier ? true : false;
};

const preprocessSketch = (imgData:ImageData, returnCanvas:HTMLCanvasElement|null = null, invert = false) => {
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
    let normalized = resized.div(255.0) as tf.Tensor3D;
    // Invert colours, so background is black (0) and strokes white (1)
    if (invert) normalized = tf.scalar(1.0).sub(normalized);
    // Only allow 0 and 1, faded colours are counted as 1 until they fully disappeared
    normalized = normalized.ceil();
    // Display extracted, processed image on prediction panel canvas
    if (returnCanvas) {
      const [width, height] = normalized.shape;
      returnCanvas.width = width;
      returnCanvas.height = height;
      tf.browser.toPixels(normalized, returnCanvas);
    }
      //We add a dimension to get a batch shape
    const batched = normalized.expandDims(0);
    return batched;
  });
};

const rescale = (c:number,offset:number,scale:number) => (c-offset)*scale;

const createSketchImage = (strokes:Array<Stroke>|Array<StrokeSlice>,x:number,y:number,l:number,h:number,dimX=28,dimY=28) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
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

// Make prediction for sound sketch classifier (noisy/calm, thin/thick)
const makeSoundSketchPrediction = async (preprocessed:tf.Tensor<tf.Rank>) => {
  const [out1, out2] = soundSketchClassifier.predict(preprocessed) as tf.Tensor[];
  const noisyCalm = await out1.data();
  const thinThick = await out2.data(); 
  return [noisyCalm[0],thinThick[0]];
};

// Make prediction for sketch feature classifier (acute angle, curve, obtuse angle, straight line)

const featureNames = ["Line","Curve","Acute","Obtuse"]
const makeSketchFeaturePrediction = async (preprocessed:tf.Tensor<tf.Rank>) => {
  const out = sketchFeatureClassifier.predict(preprocessed) as tf.Tensor;
  const data = Array.from(await out.data());
  // Get index with highest value
  const prediction = data.reduce((prediction,current:number,i:number)=>(
    current>prediction.probability?
    {"probability":current,"category":featureNames[i]}:
    prediction),{"probability":0,"category":"None"})
  return prediction as Feature;
}

export {
  loadModel,
  makeSoundSketchPrediction,
  makeSketchFeaturePrediction,
  createSketchImage,
  preprocessSketch,
};
