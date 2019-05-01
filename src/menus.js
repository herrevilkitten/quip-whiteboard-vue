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

export function configureMenu(app) {
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
        handler: () => { }
      },
      {
        id: "menu-actions-copy",
        label: "Copy",
        handler: () => { }
      },
      {
        id: "menu-actions-paste",
        label: "Paste",
        handler: () => { }
      }
    ],
    highlightedCommandIds: []
  });
}
