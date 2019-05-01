export class WhiteBoardItemRecord extends quip.apps.Record {
  static getProperties = () => ({
    type: "string",
    stroke: "string",
    transparency: "number",
    fill: "string",
    strokeWidth: "number",
    path: "string",
    x: "number",
    y: "number",
    x2: "number",
    y2: "number",
    cx: "number",
    cy: "number",
    height: "number",
    width: "number",
  });

  static getDefaultProperties = () => ({
    type: "unknown"
  });
}
quip.apps.registerClass(WhiteBoardItemRecord, "white-board-item-record");
