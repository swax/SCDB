import { TableOrm } from "../ormTypes";

const episodeOrm: TableOrm = {
  name: "episode",
  label: "Episode",
  title: "Episode ${episode.number} - ${episode.season.lookup_slug}",
  fields: [
    {
      label: "Season",
      column: "season_id",
      type: "lookup",
      lookup: {
        table: "season",
        labelColumn: "lookup_slug",
      },
    },
    {
      label: "Episode Number",
      column: "number",
      type: "number",
    },
    {
      label: "Air Date",
      column: "air_date",
      type: "date",
      optional: true,
    },
    {
      label: "Title",
      column: "title",
      type: "string",
      optional: true,
    },
    {
      label: "Description",
      column: "description",
      type: "string",
      optional: true,
    },
    {
      label: "Lookup Slug",
      column: "lookup_slug",
      type: "string",
      templates: ["${season.lookup_slug}E${number}"],
    },
    {
      label: "URL Slug",
      column: "url_slug",
      type: "slug",
      derivedFrom: "lookup_slug",
    },
  ],
};

export default episodeOrm;
