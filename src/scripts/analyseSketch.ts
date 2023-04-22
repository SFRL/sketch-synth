import {
  createSketchImage,
  preprocessSketch,
  makeSoundSketchPrediction,
  makeSketchFeaturePrediction,
} from "./tensorflowModel";
import {Sketch} from "./sketchClasses";

// Default sketch analysis, representing an empty canvas
const defaultSketchAnalysis = {
    noisy: 0.5, 
    thin: 0.5, 
    feature: "None", 
    speed: 0, 
    centerX: 0.5, 
    centerY: 0.5, 
    width: 0, 
    height: 0, 
    strokes: 0, 
    length: 0,
};

/**
 * Extract sketch features (corner, curve, line etc.) from last n points
 * @param {Sketch} sketch The sketch from which last n points are extracted for feature analysis
 * @param {HTMLCanvasElement|null} canvas Canvas element to draw the processed sketch on, to visualise what the model sees
 * @param {number} n Number of points contained in the slice that is analysed
 * @returns {Feature} Feature object containing the feature category and probability
 */
const sketchFeatureAnalysis = async (sketch:Sketch,canvas:HTMLCanvasElement|null,n=15) => {
    const currentSlice = sketch.getCurrentSlice(n)
    if (currentSlice.x.length===0) return {"probability":0,"category":"None"};
    const [xSlice, ySlice, lSlice, hSlice] = sketch.getBoundingBox([currentSlice]);
    const tempCanvas = createSketchImage(
        [currentSlice],
        xSlice,
        ySlice,
        lSlice,
        hSlice,
        100,
        100
    );
    if (!tempCanvas) return {"probability":0,"category":"None"};

    const processedSliceImg = preprocessSketch(tempCanvas, canvas);
    const feature = await makeSketchFeaturePrediction(processedSliceImg);

    // Update feature categories for stroke
    const stroke = currentSlice.stroke;
    currentSlice.indices.forEach((i) => {
        stroke.updateFeatureCategory(feature,i);
    });

    return feature;
}
/**
* Categorise sketch as noisy/calm and thin/thick
* @param {Sketch} sketch - Sketch object to be analysed
* @param {HTMLCanvasElement|null} canvas - Canvas element to draw the processed sketch on, to visualise what the model sees
* @param {number} x - x coordinate of the top left corner of the bounding box
* @param {number} y - y coordinate of the top left corner of the bounding box
* @param {number} l - width of the bounding box
* @param {number} h - height of the bounding box
*/
const sketchCategoryAnalysis = async (sketch:Sketch,canvas:HTMLCanvasElement|null,x:number,y:number,l:number,h:number) => {
    // Make sound-sketch prediction from the whole sketch 
    const tempCanvas = createSketchImage(sketch.strokes,x,y,l,h,100,100);
    if (!tempCanvas) return [0.5,0.5];
    const processedSketchImg = preprocessSketch(tempCanvas, canvas);
    return await makeSoundSketchPrediction(processedSketchImg);
}

/**
 * Analyse sketch and return features
 * @param {Sketch} sketch - Sketch object to be analysed
 * @param {HTMLCanvasElement|null} sketchCanvas - Canvas element to draw the processed sketch on, to visualise what the noisy/calm and thin/thick model sees
 * @param {HTMLCanvasElement|null} sliceCanvas - Canvas element to draw the processed slice on, to visualise what the feature model sees
 * @returns {typeof defaultSketchAnalysis} Object containing the noisy, thin, feature, speed, centerX, centerY, width, height, strokes and length features
 */
const analyseSketch = async (sketch:Sketch,sketchCanvas:HTMLCanvasElement|null=null,sliceCanvas:HTMLCanvasElement|null=null) => {
    // Get bounding box of sketch
    const [x,y,l,h] = sketch.getBoundingBox();
    // Categorise sketch as noisy/calm and thin/thick
    const [noisy, thin] = await sketchCategoryAnalysis(sketch,sketchCanvas,x,y,l,h);
    // Make sketch feature prediction from last n points:
    const feature = await sketchFeatureAnalysis(sketch,sliceCanvas);
    // Calculate remaining features
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

export {analyseSketch,defaultSketchAnalysis}