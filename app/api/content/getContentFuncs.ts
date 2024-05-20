import { getPerson } from "@/backend/content/personService";
import { getSketch } from "@/backend/content/sketchService";

const getContentFuncs = {
  sketch: getSketch,
  person: getPerson,
};

export default getContentFuncs;
