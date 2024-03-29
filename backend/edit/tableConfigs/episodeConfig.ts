import { TableEditConfig } from "./tableEditTypes";

const episodeConfig: TableEditConfig = {
  table: "episode",
  name: "Episode",
  fields: [
    {
      name: "Title",
      column: "title",
      type: "string",
    },
    {
      name: "Description",
      column: "description",
      type: "string",
      template:
        "${episode.season.description}: Episode ${episode.number}: ${episode.title}",
    },
    {
      name: "Slug",
      column: "slug",
      type: "slug",
      derivedFrom: "description",
    },
    {
      name: "Episode Number",
      column: "number",
      type: "number",
    },
    {
      name: "Air Date",
      column: "air_date",
      type: "date",
    },
    {
      name: "Season",
      column: "season_id",
      type: "lookup",
      lookup: {
        table: "season",
        column: "description",
      },
    },
  ],
};

export default episodeConfig;
