import characterCms from "./tables/characterCms";
import episodeCms from "./tables/episodeCms";
import personCms from "./tables/personCms";
import seasonCms from "./tables/seasonCms";
import showCms from "./tables/showCms";
import sketchCms from "./tables/sketchCms";
import { DatabaseCms } from "./cmsTypes";
import categoryCms from "./tables/categoryCms";
import tagCms from "./tables/tagCms";
import recurringSketch from "./tables/recurringSketchCms";
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
