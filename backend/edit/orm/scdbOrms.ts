import { DatabaseOrms } from "./tableOrmTypes";
import characterOrm from "./tables/characterOrm";
import episodeOrm from "./tables/episodeOrm";
import personOrm from "./tables/personOrm";
import seasonOrm from "./tables/seasonOrm";
import showOrm from "./tables/showOrm";
import sketchOrm from "./tables/sketchOrm";
import tagCategoryOrm from "./tables/tagCategoryOrm";
import tagOrm from "./tables/tagOrm";

const scdbOrms: DatabaseOrms = {
  character: characterOrm,
  episode: episodeOrm,
  season: seasonOrm,
  person: personOrm,
  show: showOrm,
  sketch: sketchOrm,
  tag: tagOrm,
  tag_category: tagCategoryOrm,
};

Object.freeze(scdbOrms); // Doesn't seem to prevent modification like it should

export default scdbOrms;
