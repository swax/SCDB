import characterOrm from "./tables/characterOrm";
import episodeOrm from "./tables/episodeOrm";
import personOrm from "./tables/personOrm";
import seasonOrm from "./tables/seasonOrm";
import showOrm from "./tables/showOrm";
import sketchOrm from "./tables/sketchOrm";
import { DatabaseOrm } from "./ormTypes";
import categoryOrm from "./tables/categoryOrm";
import tagOrm from "./tables/tagOrm";
import recurringSketch from "./tables/recurringSketchOrm";
import "server-only";

const sketchDatabaseOrm: DatabaseOrm = {
  character: characterOrm,
  episode: episodeOrm,
  season: seasonOrm,
  person: personOrm,
  show: showOrm,
  sketch: sketchOrm,
  tag: tagOrm,
  category: categoryOrm,
  recurring_sketch: recurringSketch,
};

Object.freeze(sketchDatabaseOrm); // Doesn't seem to prevent modification like it should

export default sketchDatabaseOrm;
