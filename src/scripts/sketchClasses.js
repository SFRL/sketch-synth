const eucledianDistance = (p1, p2) =>
  Math.sqrt(
    p1
      .map((p1val, i) => (p1val - p2[i]) ** 2)
      .reduce((sum, current) => sum + current, 0)
  );

// Class for whole sketch
class Sketch {
  constructor(w, h, t, canvas, lineColour=[0,0,0], blendColour=[255,255,255], featureColours={
      Acute: [255, 0, 0],
      Obtuse: [0, 255, 0],
      Curve: [0, 0, 255],
      Line: [255, 255, 0],
      None: [0,0,0],
    } ,lineWidth=6, decay=0.0001) {
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

  drawSketch(p, currentTime, showFeatures=false) {
    this.strokes.forEach((stroke) =>
      stroke.drawStroke(p, currentTime, this.lineWidth, this.lineColour,this.featureColours,this.blendColour, this.decay, showFeatures)
    );
    this.removeAllEmptyStrokes();
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
    //Time stamp
    this.time = [];
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
      const newProbability = feature[0];
      // Retrieve entry for index 
      const probability = this.featureCategory[index][0];
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

  drawStroke(p, currentTime,lineWidth,lineColour,featureColours,blendColour,decay,showFeatures=false) {
    p.strokeWeight(lineWidth);

    for (let i = 0; i < this.length; i++) {
      const fade = Math.min((currentTime - this.time[i]) * decay, 1);

      // Choose colour based on feature category is activated
      const colour = showFeatures ? featureColours[this.featureCategory[i][1]] : lineColour;

      const fadedColour = colour.map(
        (c, i) => c - (c - blendColour[i]) * fade
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
