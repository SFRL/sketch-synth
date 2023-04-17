import simplifyPath from "./RDP";
import shortstraw from "./shortstraw";

const eucledianDistance = (p1, p2) =>
  Math.sqrt(
    p1
      .map((p1val, i) => (p1val - p2[i]) ** 2)
      .reduce((sum, current) => sum + current, 0)
  );

// Class for whole sketch
class Sketch {
  constructor(w, h, t, canvas) {
    //Array to hold strokes
    this.strokes = [];
    // Canvas Element
    this.canvas = canvas || null;
    //Dimensions of canvas of sketch
    this.width = w || 0;
    this.height = h || 0;
    //Start time of sketch
    this.time = t || 0;
    //Number of strokes
    this.length = 0;
    //Number of points (including stroke that has not been added to sketch yet)
    this.totalStrokeLength = 0;
    // Array holding indices of corner points
    this.cornerCoords = { x: [], y: [] };
    this.shortstraw = undefined;

    //Colours
    this.lineColour = [0, 0, 0];
    this.featureColours = this.featureColours || {
      Acute: [255, 0, 0],
      Obtuse: [0, 255, 0],
      Curve: [0, 0, 255],
      Line: [255, 255, 0],
      None: this.lineColour,
    };
  }

  // Set canvas element
  setCanvas(canvas) {
    this.canvas = canvas;
  }

  // Save the size of the canvas
  setCanvasSize(w, h) {
    this.width = w;
    this.height = h;
  }

  addStroke(stroke) {
    this.strokes.push(stroke);
    this.length++;
  }
  updateLastStroke(stroke) {
    this.strokes[this.length - 1] = stroke;
  }
  removeLastStroke() {
    if (this.length > 0) {
      this.strokes.pop(this.length - 1);
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

  calculateCornerPoints() {
    const shortstrawAnalysis = shortstraw(this.strokes);
    const cornerIndices = shortstrawAnalysis[0];
    const resampledData = shortstrawAnalysis[3];

    const cornerCoords = { x: [], y: [] };

    cornerIndices.forEach((array, i) => {
      const stroke = resampledData[i];
      array.forEach((index) => {
        cornerCoords.x.push(stroke[0][index]);
        cornerCoords.y.push(stroke[1][index]);
      });
    });

    this.cornerCoords = cornerCoords;
    this.shortstraw = shortstrawAnalysis;
  }

  updateCornerCoords(cornerCoords) {
    this.cornerCoords.x = cornerCoords.x;
    this.cornerCoords.y = cornerCoords.y;
  }

  drawSketch(p, currentTime, simplified=false, showFeatures=false) {
    this.strokes.forEach((stroke) =>
      stroke.drawStroke(p, currentTime, simplified, showFeatures)
    );
    this.removeAllEmptyStrokes();
  }

  drawCornerPoints(p) {
    p.stroke("red");
    const [X, Y] = [this.cornerCoords.x, this.cornerCoords.y];
    X.forEach((x, i) => p.point(x, Y[i]));
  }

  // Bounding box of sketch in format [x,y,w,h] (x/y position of top left corner and width and height of box)
  getBoundingBox() {
    // Get bounding box dimensions of sketch
    let maxX = 0;
    let maxY = 0;
    let minX = this.width;
    let minY = this.height;
    this.strokes.forEach((stroke) => {
      maxX = Math.max(maxX, Math.max(...stroke.x));
      maxY = Math.max(maxY, Math.max(...stroke.y));
      minX = Math.min(minX, Math.min(...stroke.x));
      minY = Math.min(minY, Math.min(...stroke.y));
    });
    return [minX, minY, Math.max(maxX - minX, 0), Math.max(maxY - minY, 0)];
  }

  // Get slice of last n points in current stroke 
  getCurrentSlice(limit=10) {
    const stroke = this.strokes[this.length-1];
    if (!stroke || !stroke.isSketching) return {"x":[],"y":[],"stroke": stroke, "indices": []};
    // Get last n points according to limit
    const [X,Y] = [
      stroke.x.slice(Math.max(stroke.length - limit,0)),
      stroke.y.slice(Math.max(stroke.length - limit, 0))
    ]
    // Calculate indices of points in the slice
    const indices = X.map((_,index)=>Math.max(stroke.length - limit,0)+index)
    // Return current slice
    return {"x":X,"y":Y,"stroke": stroke, "indices": indices}
  }

  // Calculate sketching speed 
  getCurrentSpeed(limit=5,scale=true) {
    const stroke = this.strokes[this.length - 1];
    // If sketch is too short or not currently sketching, the speed is 0
    if (!stroke || !stroke.isSketching || stroke.length < limit) return 0

    // If scale true, normalise distance to canvas size
    const scaleFactor = scale?[1000/this.width,1000/this.height]:[1,1];
    // Get last n points according to limit
    const [X, Y] = [
      stroke.x.slice(stroke.length - limit),
      stroke.y.slice(stroke.length - limit),
    ];
    // Get time difference between current point and 5 points back
    const timePassed = stroke.time[stroke.length-1] - stroke.time[stroke.length-limit];

    // Calculate eucledian distance between points
    const distance = X.reduce((length,_,index)=> {
      const [p1, p2] = [
            [scaleFactor[0]*X[index], scaleFactor[1]*Y[index]],
            [scaleFactor[0]*X[index - 1], scaleFactor[1]*Y[index - 1]],
          ];
      return index ? length + eucledianDistance(p1,p2) : 0
  },0)
    return distance/timePassed;
  }

  // format data the same way as Quick, Draw! dataset for export
  getData() {
    const sketch = [];
    this.strokes.forEach((stroke) =>
      sketch.push([stroke.x, stroke.y, stroke.time])
    );

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

  clearData(time) {
    // Delete all strokes
    this.strokes = [];
    this.length = 0;
    this.totalStrokeLength = 0;
    // Add current time as new start time
    this.time = time;
  }
}

// Class for individual strokes
class Stroke {
  constructor(lineColour, lineWidth, blendColour, decay) {
    //Original x and y position
    this.x = [];
    this.y = [];
    //Simplified x and y position
    this.sx = [];
    this.sy = [];
    //Time stamp
    this.time = [];
    // Appearance
    this.lineColour = lineColour || [0, 0, 0];
    this.blendColour = blendColour || [255, 255, 255];
    this.lineWidth = lineWidth || 6;
    this.featureColours = this.featureColours || {"Acute": [255, 0, 0], "Obtuse": [0, 255, 0], "Curve": [0, 0, 255], "Line": [255, 255, 0], "None": lineColour}
    // Number of all original points
    this.length = 0;
    // Does the stroke have a opacity above 0
    this.visible = true;
    this.decay = decay || 0.0025;
    // flag if stroke is currently drawn
    this.isSketching = true;

    // keep track of sketch feature predictions
    this.featureCategory = [];
  }

  addPoint(x_, y_, time_) {
    //Only add point if it's at a different location than previous point
    if (x_ === this.x[this.length - 1] && y_ === this.y[this.length - 1]) {
      return false;
    }
    this.x.push(x_);
    this.y.push(y_);
    this.time.push(time_);
    // Add empty feature category which will be updated later
    this.featureCategory.push([0,"None"]); // [probability, category]
    this.length++;
    return true;
  }

  updateFeatureCategory(feature=[0 ,"None"],index) {
      const [newProbability,newCategory] = feature;
      // Retrieve entry for index 
      const [probability,cateory] = this.featureCategory[index];
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
    //Original x and y position
    this.x = [];
    this.y = [];
    //Simplified x and y position
    this.sx = [];
    this.sy = [];
    //Time stamp
    this.time = [];
    this.featureCategory = [];
    // Number of all original points
    this.length = 0;
  }

  simplify(epsilon) {
    [this.sx, this.sy] = simplifyPath(this.x, this.y, epsilon);
  }

  drawStroke(p, currentTime, simplified,showFeatures=false) {
    // Choose between simplified and original points
    let l, x, y;
    [l, x, y] = simplified
      ? [this.sx.length, this.sx, this.sy]
      : [this.length, this.x, this.y];

    p.strokeWeight(this.lineWidth);

    for (let i = 0; i < this.length; i++) {
      const fade = Math.min((currentTime - this.time[i]) * this.decay, 1);

      // Choose colour based on feature category is activated
      const lineColour = showFeatures ? this.featureColours[this.featureCategory[i][1]] : this.lineColour;

      const fadedColour = lineColour.map(
        (c, i) => c - (c - this.blendColour[i]) * fade
      );
      // Remove point if it's no-longer visible
      if (fade === 1) this.removeFirstPoint();

      p.stroke(fadedColour);

      // Retrieve 4 points for curve, make sure that index does not go below zero
      const points = [];
      for (let j = 3; j >= 0; j--) {
        const idx = Math.max(i - j, 0);
        points.push(this.x[idx]);
        points.push(this.y[idx]);
      }
      p.curve.apply(p, points);
    }
  }
}

export { Sketch, Stroke };
