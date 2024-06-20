import characterCms from "./tables/characterOrm";
import episodeCms from "./tables/episodeOrm";
import personCms from "./tables/personOrm";
import seasonCms from "./tables/seasonOrm";
import showCms from "./tables/showOrm";
import sketchCms from "./tables/sketchOrm";
import { DatabaseCms } from "./ormTypes";
import categoryCms from "./tables/categoryOrm";
import tagCms from "./tables/tagOrm";
import recurringSketch from "./tables/recurringSketchOrm";
import "server-only";

const sketchDatabaseCms: DatabaseCms = {
  character: characterCms,
  episode: episodeCms,
  season: seasonCms,
  person: personCms,
  show: showCms,
  sketch: sketchCms,
  tag: tagCms,
  category: categoryCms,
  recurring_sketch: recurringSketch,
};

Object.freeze(sketchDatabaseCms); // Doesn't seem to prevent modification like it should

export default sketchDatabaseCms;
