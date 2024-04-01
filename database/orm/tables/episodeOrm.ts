import { TableOrm } from "../ormTypes";

const episodeOrm: TableOrm = {
  name: "episode",
  label: "Episode",
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
      template: "${episode.season.lookup_slug} E${episode.number}",
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
