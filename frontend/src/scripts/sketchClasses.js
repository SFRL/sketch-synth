import simplifyPath from "./RDP";

// Class for whole sketch
class Sketch {
  constructor(w, h, t, canvas) {
    //Array to hold strokes
    this.strokes = [];
    // Canvas Element
    this.canvas = canvas || null;
    //Dimensions of sketch
    this.width = w || 0;
    this.height = h || 0;
    //Start time of sketch
    this.time = t || 0;
    //Number of strokes
    this.length = 0;
    //Number of points (including stroke that has not been added to sketch yet)
    this.totalStrokeLength = 0;
    // Array holding indices of corner points
    this.cornerCoords = {x:[],y:[]};
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

  updateCornerCoords(cornerCoords) {
    this.cornerCoords.x = cornerCoords.x;
    this.cornerCoords.y = cornerCoords.y
    // console.log(this.cornerPoints);
  }

  drawSketch(p, currentTime, simplified) {
    this.strokes.forEach((stroke) =>
      stroke.drawStroke(p, currentTime, simplified)
    );
    this.removeAllEmptyStrokes();
  }

  drawCornerPoints(p) {
    p.stroke("red");
    const [X,Y] = [this.cornerCoords.x,this.cornerCoords.y]
    X.forEach((x,i)=>p.point(x,Y[i]));
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
    // Number of all original points
    this.length = 0;
    // Does the stroke have a opacity above 0
    this.visible = true;
    this.decay = decay || 0.0025;
  }

  addPoint(x_, y_, time_) {
    //Only add point if it's at a different location than previous point
    if (x_ === this.x[this.length - 1] && y_ === this.y[this.length - 1]) {
      return false;
    }
    this.x.push(x_);
    this.y.push(y_);
    this.time.push(time_);
    this.length++;
    return true;
  }

  removeFirstPoint() {
    if (this.length > 0) {
      this.x.shift();
      this.y.shift();
      this.time.shift();
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
    // Number of all original points
    this.length = 0;
  }

  simplify(epsilon) {
    [this.sx, this.sy] = simplifyPath(this.x, this.y, epsilon);
  }

  drawStroke(p, currentTime, simplified) {
    // Choose between simplified and original points
    let l, x, y;
    [l, x, y] = simplified
      ? [this.sx.length, this.sx, this.sy]
      : [this.length, this.x, this.y];

    p.strokeWeight(this.lineWidth);

    for (let i = 0; i < this.length; i++) {
      const fade = Math.min((currentTime - this.time[i]) * this.decay, 1);
      const fadedColour = this.lineColour.map(
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
