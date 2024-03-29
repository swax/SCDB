import characterConfig from "./characterConfig";
import episodeConfig from "./episodeConfig";
import personConfig from "./personConfig";
import seasonConfig from "./seasonConfig";
import showConfig from "./showConfig";
import sketchConfig from "./sketchConfig";
import { TableEditConfigs } from "./tableEditTypes";
import tagCategoryConfig from "./tagCategoryConfig";
import tagConfig from "./tagConfig";

const tableEditConfigs: TableEditConfigs = {
  character: characterConfig,
  episode: episodeConfig,
  season: seasonConfig,
  person: personConfig,
  show: showConfig,
  sketch: sketchConfig,
  tag: tagConfig,
  tag_category: tagCategoryConfig,
};

Object.freeze(tableEditConfigs); // Doesn't seem to prevent modification like it should

export default tableEditConfigs;
