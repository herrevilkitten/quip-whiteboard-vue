export const MODES = {
  SELECT: -1,
  DRAW_PENCIL: 0,
  DRAW_LINE: 1,
  DRAW_RECTANGLE: 2,
  DRAW_OVAL: 3,
};

export class Shape {
  constructor(svg, options) {
    options = options || {};
    options.stroke = options.stroke || '#000';
    options.fill = options.fill || '#000';
    options.width = options.width || 1;
    options.transparency = options.transparency || 1;
    this.svg = svg;
    this.options = options;
    this.original = undefined;
  }

  startDrawing(event) {
    return this;
  }

  continueDrawing(event) {
    return this;
  }

  endDrawing(event) {
    if (this.original) {
      this.original.stroke(this.options.stroke);
      this.original.attr('stroke-opacity', this.options.transparency);
      this.original.fill(this.original.attr('fill') === 'none' ? 'none' : this.options.fill);
      this.original.attr('fill-opacity', this.options.transparency);
    }
    return this;
  }

  parseMouseEvent(event) {
    let x;
    let y;
    if (event instanceof MouseEvent) {
      x = event.offsetX;
      y = event.offsetY;
    } else {
      const rect = event.target.getBoundingClientRect();
      x = event.targetTouches[0].pageX - rect.left;
      y = event.targetTouches[0].pageY - rect.top;
    }
    return {
      x: x,
      y: y
    };
  }

  toJSON() {
    return {
      stroke: this.original.attr('stroke'),
      transparency: this.original.attr('stroke-opacity'),
      fill: this.original.attr('fill'),
      strokeWidth: this.original.attr('stroke-width')
    };
  }

  fromJSON() { }
}

export class PencilShape extends Shape {
  constructor(svg, options) {
    super(svg, options);

    this.lastNode = "";
  }

  startDrawing(event) {
    const { x, y } = this.parseMouseEvent(event);
    this.lastNode = "M" + x + " " + y;
    this.original = this.svg.path(this.lastNode).attr({
      fill: "none",
      stroke: "rgba(0, 0, 0, .5)",
      "stroke-width": this.options.width
    });
    return this;
  }

  continueDrawing(event) {
    const { x, y } = this.parseMouseEvent(event);
    this.lastNode = "L" + x + " " + y;
    this.original.attr({
      d: (this.original.attr("d") || "") + " " + this.lastNode,
      fill: "none",
      stroke: "rgba(0, 0, 0, .5)",
      "stroke-width": this.options.width
    });
    return this;
  }

  toJSON() {
    console.log('pencil', this.original);
    return {
      type: 'pencil',
      path: this.original.attr("d"),
      ...(super.toJSON())
    }
  }

  fromJSON(json) {
    this.original = this.svg.path(json.path)
      .attr({
        fill: json.fill,
        stroke: json.stroke,
        "stroke-width": json.strokeWidth,
        "stroke-opacity": json.transparency,
        "fill-opacity": json.transparency,
      });
  }
}

export class LineShape extends Shape {
  startDrawing(event) {
    const { x, y } = this.parseMouseEvent(event);
    this.original = this.svg.line(x, y, x, y).attr({
      fill: "rgba(0, 0, 0, .5)",
      stroke: "rgba(0, 0, 0, .5)",
      "stroke-width": this.options.width,
      x2: x,
      y2: y,
      originalX: x,
      originalY: y
    });
    return this;
  }

  continueDrawing(event) {
    const { x, y } = this.parseMouseEvent(event);
    this.original.attr({
      fill: "rgba(0, 0, 0, .5)",
      stroke: "rgba(0, 0, 0, .5)",
      x2: x,
      y2: y
    });
    return this;
  }

  toJSON() {
    return {
      type: 'line',
      x: this.original.attr('x'),
      y: this.original.attr('y'),
      x2: this.original.attr('x2'),
      y2: this.original.attr('y2'),
      ...(super.toJSON())
    }
  }

  fromJSON(json) {
    this.original = this.svg.line(json.x, json.y, json.x2, json.y2)
      .attr({
        fill: json.fill,
        stroke: json.stroke,
        "stroke-width": json.strokeWidth,
        "stroke-opacity": json.transparency,
        "fill-opacity": json.transparency,
      });
  }
}

export class RectangleShape extends Shape {
  startDrawing(event) {
    const { x, y } = this.parseMouseEvent(event);
    this.original = this.svg
      .rect(1, 1)
      .attr({
        fill: "rgba(0, 0, 0, .5)",
        stroke: "rgba(0, 0, 0, .5)",
        "stroke-width": this.options.width,
        originalX: x,
        originalY: y
      })
      .move(x, y);
    return this;
  }

  continueDrawing(event) {
    const { x, y } = this.parseMouseEvent(event);
    const originalX = this.original.attr("originalX");
    const originalY = this.original.attr("originalY");
    let width = Math.abs(originalX - x);
    let height = Math.abs(originalY - y);
    let newX = originalX;
    let newY = originalY;
    if (event.shiftKey) {
      height = width = Math.min(height, width);
      if (originalX > x) {
        newX = originalX - width;
      }
      if (originalY > y) {
        newY = originalY - height;
      }
    } else {
      if (originalX > x) {
        newX = x;
      }
      if (originalY > y) {
        newY = y;
      }
    }

    if (newX !== originalX || newY !== originalY) {
      this.original.move(newX, newY);
    }
    this.original.size(width, height);
    this.original.attr({
      fill: "rgba(0, 0, 0, .5)",
      stroke: "rgba(0, 0, 0, .5)"
    });
    return this;
  }

  toJSON() {
    return {
      type: 'rectangle',
      height: this.original.height(),
      width: this.original.width(),
      x: this.original.x(),
      y: this.original.y(),
      ...(super.toJSON())
    }
  }

  fromJSON(json) {
    this.original = this.svg.rect(1, 1)
      .move(json.x, json.y)
      .size(json.width, json.height)
      .attr({
        fill: json.fill,
        stroke: json.stroke,
        "stroke-width": json.strokeWidth,
        "stroke-opacity": json.transparency,
        "fill-opacity": json.transparency,
      });
  }
}

export class EllipseShape extends Shape {
  startDrawing(event) {
    const { x, y } = this.parseMouseEvent(event);
    this.original = this.svg
      .ellipse(1, 1)
      .attr({
        fill: "rgba(0, 0, 0, .5)",
        stroke: "rgba(0, 0, 0, .5)",
        "stroke-width": this.options.width,
        originalX: x,
        originalY: y
      })
      .move(x, y);
    return this;
  }

  continueDrawing(event) {
    const { x, y } = this.parseMouseEvent(event);
    const originalX = this.original.attr("originalX");
    const originalY = this.original.attr("originalY");
    let width = Math.abs(originalX - x) * 2;
    let height = Math.abs(originalY - y) * 2;
    if (event.shiftKey) {
      height = width = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    }
    this.original.size(width, height);
    this.original.attr({
      fill: "rgba(0, 0, 0, .5)",
      stroke: "rgba(0, 0, 0, .5)"
    });
    return this;
  }

  toJSON() {
    return {
      type: 'ellipse',
      height: this.original.height(),
      width: this.original.width(),
      cx: this.original.cx(),
      cy: this.original.cy(),
      ...(super.toJSON())
    }
  }

  fromJSON(json) {
    this.original = this.svg.ellipse(1, 1)
      .move(json.cx, json.cy)
      .size(json.width, json.height)
      .attr({
        fill: json.fill,
        stroke: json.stroke,
        "stroke-width": json.strokeWidth,
        "stroke-opacity": json.transparency,
        "fill-opacity": json.transparency,
      });
  }
}
