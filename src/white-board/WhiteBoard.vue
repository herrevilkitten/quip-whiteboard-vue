<template>
  <div>
    <div class="white-board-canvas">
    </div>
  </div>
</template>

<script>
import SVG from "svg.js";

import {
  MODES,
  PencilShape,
  LineShape,
  RectangleShape,
  EllipseShape
} from "./shapes.js";

export default {
  props: [
    "records",
    "mode",
    "stroke",
    "fill",
    "transparency",
    "width",
    "canvas"
  ],
  data() {
    return {
      board: null,
      selected: null
    };
  },
  methods: {
    setSelection: function(selection) {
      if (!selection) {
        selection = null;
      }
      if (this.selected) {
        this.selected.remove();
        this.selected = null;
      } else {
        this.selected = selection;
      }
      this.selected = selection;
      this.$emit("events", {
        type: "selection",
        selection: this.selected
      });
    },
    erase: function() {
      console.log("Erasing document");
      this.board.clear();
      this.records.delete();
      this.setSelection();
    }
  },
  watch: {
    canvas: function(newVal, oldVal) {
      console.log("Canvas changed:", oldVal, "=>", newVal);
      this.board.size(newVal.width, newVal.height);
    },
    mode: function(newVal, oldVal) {
      console.log("Mode changed:", oldVal, "=>", newVal);
      this.setSelection();
    }
  },
  mounted() {
    this.board = SVG(this.$el.querySelector(".white-board-canvas")).size(
      this.canvas.width,
      this.canvas.height
    );

    if (this.records) {
      this.records.getRecords().forEach(record => {
        const data = record.getData();
        console.log("record", data);

        switch (data.type) {
          case "pencil":
            new PencilShape(this.board).fromJSON(data);
            break;
          case "line":
            new LineShape(this.board).fromJSON(data);
            break;
          case "rectangle":
            new RectangleShape(this.board).fromJSON(data);
            break;
          case "ellipse":
            new EllipseShape(this.board).fromJSON(data);
            break;
        }
      });
    }

    this.board.on("mousedown", $event => {
      console.log(this.mode);
      this.mouseDown = true;
      let x;
      let y;
      if ($event instanceof MouseEvent) {
        x = $event.offsetX;
        y = $event.offsetY;
      } else {
        x = $event.touches.item(0).clientX;
        y = $event.touches.item(0).clientY;
      }

      console.log("event we got", $event);

      if (this.shape) {
        this.shape.endDrawing($event);
      }

      const options = {
        stroke: this.stroke,
        fill: this.fill,
        width: this.width,
        transparency: this.transparency
      };
      console.log(options);
      switch (Number(this.mode)) {
        case MODES.SELECT:
          console.log("Select");
          var children = this.board.children();
          var topChild = null;
          var foundSelected = false;
          var firstChild = null;
          for (var i = 0; i < children.length; ++i) {
            if (
              !children[i].attr("not-selectable") &&
              children[i].inside(x, y)
            ) {
              if (!firstChild) {
                firstChild = children[i];
              }
              window.console.log("Inside:", children[i]);
              if (this.selected) {
                window.console.log("Parent:", this.selected.cloneParent);
              }
              if (!this.selected || (this.selected && foundSelected)) {
                topChild = children[i];
                break;
              } else if (children[i] === this.selected.cloneParent) {
                window.console.log("Found selected");
                foundSelected = true;
              }
            }
          }
          if (this.selected) {
            this.setSelection();
            if (topChild === null) {
              window.console.log("No topChild, using firstChild");
              topChild = firstChild;
            }
          }
          if (topChild !== null) {
            window.console.log("Top child is", topChild);
            const selection = topChild.clone();
            selection.attr({
              stroke: "#00F",
              "stroke-width": 2,
              "fill-opacity": 0,
              "not-selectable": true
            });
            selection.cloneParent = topChild;
            this.setSelection(selection);
          }
          break;
        case MODES.DRAW_PENCIL:
          this.shape = new PencilShape(this.board, options).startDrawing(
            $event
          );
          break;
        case MODES.DRAW_LINE:
          this.shape = new LineShape(this.board, options).startDrawing($event);
          break;
        case MODES.DRAW_RECTANGLE:
          this.shape = new RectangleShape(this.board, options).startDrawing(
            $event
          );
          break;
        case MODES.DRAW_OVAL:
          this.shape = new EllipseShape(this.board, options).startDrawing(
            $event
          );
          break;
        default:
          console.log("Unknown drawing mode:", this.mode);
      }
    });
    this.board.on("mouseup", $event => {
      this.mouseDown = false;
      if (this.shape) {
        console.log(this.shape.toJSON());
        console.log(this.shape.original.attr());
        this.shape.endDrawing($event);

        if (this.shape) {
          const record = this.records.add(this.shape.toJSON());
          console.log("Added Record:", record.getData());
        }
      }
      this.shape = null;
    });
    this.board.on("mousemove", $event => {
      if (this.mouseDown && this.shape) {
        this.shape.continueDrawing($event);
      }
    });
    this.board.on("mouseleave", $event => {
      this.mouseDown = false;
      if (this.shape) {
        this.shape.endDrawing($event);
      }
      this.shape = null;
    });
    /*
    if (this.records) {
      this.itemListener = records => {
        if (!records) {
          this.board.clear();
          this.setSelection();
        } else if (this.records.length) {
          this.records = [];
        }
      };
    }
    */
  },
  beforeDestroy() {
    if (this.board) {
      this.board.off();
    }
    if (this.records && this.itemListener) {
      //      this.records.unlisten(this.itemListener);
    }
  }
};
</script>

<style lang="less" scoped>
.white-board-menu {
  display: flex;
  input:not(:first-of-type) {
    margin-left: 1rem;
  }
  input {
    margin-right: 0.25rem;
  }
}

.white-board-canvas {
  border: 1px solid rgba(0, 0, 0, 0.25);
}
</style>
