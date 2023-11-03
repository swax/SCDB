import characterConfig from "./characterConfig";
import personConfig from "./personConfig";
import showConfig from "./showConfig";
import sketchConfig from "./sketchConfig";
import { TableEditConfigs } from "./tableEditTypes";

const tableEditConfigs: TableEditConfigs = {
  character: characterConfig,
  person: personConfig,
  show: showConfig,
  sketch: sketchConfig,
};

Object.freeze(tableEditConfigs); // Doesn't seem to prevent modification like it should

export default tableEditConfigs;
