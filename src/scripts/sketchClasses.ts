import * as p5 from 'p5';

/**
 * Euclidean distance between two points in n dimensions
 * @param {Array<number>} p1 coodinates of first point
 * @param {Array<number>} p2 coordinates of second point
 * @returns {number} Euclidean distance between p1 and p2
 */
const euclideanDistance = (p1:Array<number>, p2:Array<number>) =>
  Math.sqrt(
    p1
      .map((p1val, i) => (p1val - p2[i]) ** 2)
      .reduce((sum, current) => sum + current, 0)
  );


// Define typescript interfaces for sketch and stroke classes

interface FeatureColours {
  Acute: [number,number,number];
  Obtuse: [number,number,number];
  Curve: [number,number,number];
  Line: [number,number,number];
  None: [number,number,number];
}
interface Feature {
  probability: number;
  category: keyof FeatureColours;
}

interface StrokeSlice {
  x: Array<number>;
  y: Array<number>;
  stroke: Stroke;
  indices: Array<number>;
}


// Class for individual strokes
class Stroke {
  x: Array<number> = [];
  y: Array<number> = [];
  time: Array<number> = [];
  length: number = 0;
  visible: boolean = true;
  isSketching: boolean = true;
  featureCategory: Array<Feature> = [];

  addPoint(x_:number, y_:number, time_:number) {
    //Only add point if it's at a different location than previous point
    if (x_ === this.x[this.length - 1] && y_ === this.y[this.length - 1]) {
      return false;
    }
    this.x.push(x_);
    this.y.push(y_);
    this.time.push(time_);
    // Add empty feature category which will be updated later
    this.featureCategory.push({probability: 0,category: "None"}); 
    this.length++;
    return true;
  }

  updateFeatureCategory(feature:Feature,index:number) {
      const newProbability = feature.probability;
      // Retrieve entry for index 
      const probability = this.featureCategory[index]?.probability;
      // Update entry if new probability is higher
      if (newProbability > probability) {
        this.featureCategory[index] = feature;
      }
  }

  removeFirstPoint() {
    if (this.length > 0) {
      this.x.shift();
      this.y.shift();
      this.time.shift();
      this.featureCategory.shift();
      this.length--;
    }
  }

  clearData() {
    //x and y position
    this.x = [];
    this.y = [];
    //Time stamp
    this.time = [];
    this.featureCategory = [];
    // Number of all original points
    this.length = 0;
  }

  drawStroke(p:p5, currentTime:number,lineWidth:number,lineColour:[number,number,number],featureColours:FeatureColours,blendColour:[number,number,number],decay:number,showFeatures=false) {
    p.strokeWeight(lineWidth);

    for (let i = 0; i < this.length; i++) {
      const fade = Math.min((currentTime - this.time[i]) * decay, 1);

      // Choose colour based on feature category is activated
      // TODO: figure out why this code runs super slowly when showFeatures is true
      const colour = showFeatures ? featureColours[this.featureCategory[i]["category"]] : lineColour;

      const fadedColour = colour.map(
        (c, i) => c - (c - blendColour[i]) * fade
      );
      // Remove point if it's no-longer visible
      if (fade === 1) this.removeFirstPoint();

      p.stroke(fadedColour);

      // Retrieve 4 points for curve, make sure that index does not go below zero
      const points: number[] = [];
      for (let j = 3; j >= 0; j--) {
        const idx = Math.max(i - j, 0);
        points.push(this.x[idx]||0);
        points.push(this.y[idx]||0);
      }

      p.curve(points[0], points[1], points[2], points[3], points[4], points[5], points[6], points[7]);
    }
  }
}

/** 
* Class that describes a whole sketch
* @param {number} w width of canvas
* @param {number} h height of canvas
* @param {number} t start time of sketch
* @param {p5.Renderer} canvas canvas element
* @param {Array<number>} lineColour colour of stroke lines
* @param {Array<number>} blendColour colour of background that a line will fade into
* @param {Object} featureColours colours that different features (angles, curves, lines etc) will be displayed in
* @param {number} lineWidth width of stroke lines
* @param {number} decay time it takes for a stroke to fade away
*/

const defaultFeatureColours:FeatureColours = {
  Acute: [255, 0, 0],
  Obtuse: [0, 255, 0],
  Curve: [0, 0, 255],
  Line: [255, 255, 0],
  None: [255, 255, 255],
};
class Sketch{
  width : number 
  height : number;
  time : number;
  canvas: p5.Renderer | null;
  lineColour : [number,number,number];
  blendColour : [number,number,number];
  featureColours : FeatureColours;
  strokes: Array<Stroke>;
  length: number;
  totalStrokeLength: number;
  lineWidth: number;
  decay: number;
  
  constructor( w=0, h=0, t=0, canvas=null, lineColour:[number,number,number]=[0,0,0], blendColour:[number,number,number]=[255,255,255], featureColours=defaultFeatureColours, lineWidth=6, decay=0.0004) {
    //Array to hold strokes
    this.strokes = [];
    // Canvas Element
    this.canvas = canvas;
    //Dimensions of canvas of sketch
    this.width = w;
    this.height = h;
    //Start time of sketch
    this.time = t;
    //Number of strokes
    this.length = 0;
    //Number of points (including stroke that has not been added to sketch yet)
    this.totalStrokeLength = 0;
    //Colours
    this.lineColour = lineColour;
    this.blendColour = blendColour;
    this.featureColours = featureColours;
    // Stroke line width
    this.lineWidth = lineWidth;
    // Time it takes for a stroke to fade away
    this.decay = decay;
  }

  // Set canvas element
  setCanvas(canvas: p5.Renderer) {
    this.canvas = canvas;
  }

  // Save the size of the canvas
  setCanvasSize(w : number, h : number) {
    this.width = w;
    this.height = h;
  }

  addStroke(stroke : Stroke) {
    this.strokes.push(stroke);
    this.length++;
  }
  updateLastStroke(stroke : Stroke) {
    this.strokes[this.length - 1] = stroke;
  }
  removeLastStroke() {
    if (this.length > 0) {
      this.strokes.pop();
      this.length--;
    }
  }
  removeFirstStroke() {
    if (this.length > 0) {
      this.strokes.shift();
      this.length--;
    }
  }
  updateTotalStrokeLength() {
    this.totalStrokeLength = 0;
    this.strokes.forEach((stroke) => (this.totalStrokeLength += stroke.length));
  }
  removeAllEmptyStrokes() {
    this.strokes = this.strokes.filter((stroke) => stroke.length > 0);
    this.length = this.strokes.length;
  }

  drawSketch(p:p5, currentTime:number, showFeatures = false) {
    this.strokes.forEach((stroke) =>
      stroke.drawStroke(
        p,
        currentTime,
        this.lineWidth,
        this.lineColour,
        this.featureColours,
        this.blendColour,
        this.decay,
        showFeatures
      )
    );
    this.removeAllEmptyStrokes();
  }

  // Bounding box of sketch in format [x,y,w,h] (x/y position of top left corner and width and height of box)
  getBoundingBox(strokes:Array<Stroke>|Array<StrokeSlice>|false=false) {
    // Get bounding box dimensions of sketch
    let maxX = 0;
    let maxY = 0;
    let minX = this.width;
    let minY = this.height;
    const strokeArray = strokes || this.strokes;
    strokeArray.forEach((stroke) => {
      maxX = Math.max(maxX, Math.max(...stroke.x));
      maxY = Math.max(maxY, Math.max(...stroke.y));
      minX = Math.min(minX, Math.min(...stroke.x));
      minY = Math.min(minY, Math.min(...stroke.y));
    });
    return [minX, minY, Math.max(maxX - minX, 0), Math.max(maxY - minY, 0)];
  }

  // Get slice of last n points in current stroke
  getCurrentSlice(limit = 10) {
    const stroke = this.strokes[this.length - 1];
    if (!stroke || !stroke.isSketching)
      return { x: [], y: [], stroke: stroke, indices: [] };
    // Get last n points according to limit
    const [X, Y] = [
      stroke.x.slice(Math.max(stroke.length - limit, 0)),
      stroke.y.slice(Math.max(stroke.length - limit, 0)),
    ];
    // Calculate indices of points in the slice
    const indices = X.map(
      (_, index) => Math.max(stroke.length - limit, 0) + index
    );
    // Return current slice
    return { x: X, y: Y, stroke: stroke, indices: indices } as StrokeSlice;
  }

  // Calculate sketching speed
  /** 
   * 
   * @param {number} limit number of points to be considered for speed calculation
   * @param {boolean} scale if true, normalise speed to canvas size
  */
  getCurrentSpeed(limit = 5, scale = true) {
    const stroke = this.strokes[this.length - 1];
    // If sketch is too short or not currently sketching, the speed is 0
    if (!stroke || !stroke.isSketching || stroke.length < limit) return 0;

    // If scale true, normalise distance to canvas size
    const scaleFactor = scale
      ? [1000 / this.width, 1000 / this.height]
      : [1, 1];
    // Get last n points according to limit
    const [X, Y] = [
      stroke.x.slice(stroke.length - limit),
      stroke.y.slice(stroke.length - limit),
    ];
    // Get time difference between current point and 5 points back
    const timePassed =
      stroke.time[stroke.length - 1] - stroke.time[stroke.length - limit];

    // Calculate euclidean distance between points
    const distance = X.reduce((length, _, index) => {
      const [p1, p2] = [
        [scaleFactor[0] * X[index], scaleFactor[1] * Y[index]],
        [scaleFactor[0] * X[index - 1], scaleFactor[1] * Y[index - 1]],
      ];
      return index ? length + euclideanDistance(p1, p2) : 0;
    }, 0);
    return distance / timePassed;
  }

  // format data the same way as Quick, Draw! dataset for export
  getData() {
    const sketch = this.strokes.map((stroke) => [stroke.x, stroke.y, stroke.time]);

    const sketchData = {
      canvas: this.canvas,
      canvasWidth: this.width,
      canvasHeight: this.height,
      numberOfStrokes: this.length,
      totalStrokeLength: this.totalStrokeLength,
      startTime: this.time,
      sketch: sketch,
    };
    return sketchData;
  }

  clearData(time=0) {
    // Delete all strokes
    this.strokes = [];
    this.length = 0;
    this.totalStrokeLength = 0;
    // Add current time as new start time
    this.time = time;
  }
}

export { Sketch, Stroke };

export type {Feature,FeatureColours,StrokeSlice}
