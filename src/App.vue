<template>
  <div>
    <white-board
      ref="whiteBoard"
      :records="records"
      :mode="mode"
      :stroke="stroke"
      :fill="fill"
      :transparency="transparency"
      :width="width"
      :canvas="canvas"
      @events="handleBoardEvents"
    ></white-board>
  </div>
</template>

<script>
import WhiteBoard from "./white-board/WhiteBoard.vue";

import { MODES } from "./white-board/shapes.js";

//import { configureMenu } from "./menus.js";

import "./colors.js";
import "./record.js";

const TOOLS = [
  {
    value: -1,
    label: "Select"
  },
  {
    value: 0,
    label: "Pencil"
  },
  {
    value: 1,
    label: "Line"
  },
  {
    value: 2,
    label: "Rectangle"
  },
  {
    value: 3,
    label: "Ellipse"
  }
];

const TRANSPARENCIES = [
  {
    value: 0,
    label: "Transparent"
  },
  {
    value: 0.25,
    label: "Light"
  },
  {
    value: 0.5,
    label: "Half"
  },
  {
    value: 0.75,
    label: "Dark"
  },
  {
    value: 1,
    label: "Opaque"
  }
];

var drawingMode = TOOLS[1];
var strokeColor = quip.apps.ui.ColorMap.BLACK;
var fillColor = quip.apps.ui.ColorMap.BLACK;
var transparencyColor = TRANSPARENCIES[4];
var drawingWidth = 1;
var selection = null;

function updateToolbar() {
  console.log(drawingMode, strokeColor, fillColor);
  let disabledCommandIds = [];
  if (!selection) {
    disabledCommandIds = [
      "menu-actions-cut",
      "menu-actions-copy",
      "menu-actions-paste"
    ];
  }
  quip.apps.updateToolbar({
    highlightedCommandIds: [
      `menu-tools-${drawingMode.label.toLowerCase()}`,
      `menu-drawing-stroke-${strokeColor.KEY.toLowerCase()}`,
      `menu-drawing-fill-${fillColor.KEY.toLowerCase()}`,
      `menu-drawing-transparency-${transparencyColor.label.toLowerCase()}`,
      `menu-width-${drawingWidth}`
    ],
    disabledCommandIds: disabledCommandIds
  });
}

function calculateHeight() {
  return Math.max(300, (quip.apps.getContainerWidth() * 9) / 16);
}

export default {
  components: {
    WhiteBoard
  },
  props: ["isCreation"],
  data: function() {
    return {
      records: null,
      stroke: strokeColor.VALUE,
      fill: fillColor.VALUE,
      mode: drawingMode.value,
      transparency: transparencyColor.value,
      width: drawingWidth,
      canvas: {
        width: quip.apps.getContainerWidth(),
        height: calculateHeight()
      }
    };
  },
  created: function() {
    console.log(this);

    const rootRecord = quip.apps.getRootRecord();
    console.log(this.props);
    this.records = rootRecord.get("items");
    if (!this.records) {
      rootRecord.clear("items");
      rootRecord.set("items", []);
      this.records = rootRecord.get("items");
    }
    console.log(this.records);

    const toolMenus = TOOLS.map(tool => ({
      id: `menu-tools-${tool.label.toLowerCase()}`,
      label: tool.label,
      handler: () => {
        drawingMode = tool;
        this.mode = tool.value;
        updateToolbar();
      }
    }));

    const strokeMenus = Object.keys(quip.apps.ui.ColorMap).map(key => {
      const color = quip.apps.ui.ColorMap[key];
      return {
        id: `menu-drawing-stroke-${color.KEY.toLowerCase()}`,
        label: color.LABEL,
        handler: () => {
          console.log(this);
          strokeColor = color;
          this.stroke = color.VALUE;
          updateToolbar();
        }
      };
    });

    const fillMenus = Object.keys(quip.apps.ui.ColorMap).map(key => {
      const color = quip.apps.ui.ColorMap[key];
      return {
        id: `menu-drawing-fill-${color.KEY.toLowerCase()}`,
        label: color.LABEL,
        handler: () => {
          console.log(this);
          fillColor = color;
          this.fill = color.VALUE;
          updateToolbar();
        }
      };
    });

    const transparencyMenus = TRANSPARENCIES.map(transparency => ({
      id: `menu-drawing-transparency-${transparency.label.toLowerCase()}`,
      label: transparency.label,
      handler: () => {
        transparencyColor = transparency;
        this.transparency = transparency.value;
        updateToolbar();
      }
    }));

    const widthMenus = [1, 2, 3, 4, 5, 6, 7, 8].map(width => ({
      id: `menu-width-${width}`,
      label: width,
      handler: () => {
        drawingWidth = width;
        this.width = width;
        updateToolbar();
      }
    }));

    quip.apps.updateToolbar({
      toolbarCommandIds: ["menu-tools", "menu-drawing", "menu-actions"],
      menuCommands: [
        {
          id: "menu-tools",
          label: "Tools",
          subCommands: toolMenus.map(menu => menu.id)
        },
        ...toolMenus,

        {
          id: "menu-drawing",
          label: "Drawing",
          subCommands: [
            "menu-drawing-stroke",
            "menu-drawing-fill",
            "menu-drawing-transparency",
            "menu-drawing-width"
          ]
        },
        {
          id: "menu-drawing-stroke",
          label: "Stroke",
          subCommands: strokeMenus.map(menu => menu.id)
        },
        ...strokeMenus,
        {
          id: "menu-drawing-fill",
          label: "Fill",
          subCommands: fillMenus.map(menu => menu.id)
        },
        ...fillMenus,
        {
          id: "menu-drawing-transparency",
          label: "Transparency",
          subCommands: transparencyMenus.map(menu => menu.id)
        },
        ...transparencyMenus,
        {
          id: "menu-drawing-width",
          label: "Width",
          subCommands: widthMenus.map(menu => menu.id)
        },
        ...widthMenus,
        {
          id: "menu-actions",
          label: "Actions",
          subCommands: [
            "menu-actions-erase",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "menu-actions-cut",
            "menu-actions-copy",
            "menu-actions-paste"
          ]
        },
        {
          id: "menu-actions-erase",
          label: "Erase Board",
          handler: () => {
            console.log(this);
            this.$refs.whiteBoard.erase();
          }
        },
        {
          id: "menu-actions-cut",
          label: "Cut",
          handler: () => {}
        },
        {
          id: "menu-actions-copy",
          label: "Copy",
          handler: () => {}
        },
        {
          id: "menu-actions-paste",
          label: "Paste",
          handler: () => {}
        }
      ],
      highlightedCommandIds: []
    });

    updateToolbar();

    quip.apps.addEventListener(
      quip.apps.EventType.CONTAINER_SIZE_UPDATE,
      event => {
        this.canvas = {
          width: quip.apps.getContainerWidth(),
          height: calculateHeight()
        };
      }
    );
  },
  methods: {
    handleBoardEvents: function($event) {
      console.log($event);
      switch ($event.type) {
        case "selection":
          selection = $event.selection;
          updateToolbar();
          break;
      }
    }
  }
};
</script>


<style scoped lang="less">
</style>

