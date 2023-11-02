import personConfig from "./personConfig";
import showConfig from "./showConfig";
import sketchConfig from "./sketchConfig";
import { TableEditConfigs } from "./tableEditTypes";

const tableEditConfigs: TableEditConfigs = {
  person: personConfig,
  show: showConfig,
  sketch: sketchConfig,
};

Object.freeze(tableEditConfigs); // Doesn't seem to prevent modification like it should

export default tableEditConfigs;
