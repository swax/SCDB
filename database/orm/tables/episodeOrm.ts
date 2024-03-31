import { TableOrm } from "../ormTypes";

const episodeOrm: TableOrm = {
  name: "episode",
  label: "Episode",
  fields: [
    {
      label: "Title",
      column: "title",
      type: "string",
    },
    {
      label: "Description",
      column: "description",
      type: "string",
      template:
        "${episode.season.description} E${episode.number}",
    },
    {
      label: "Slug",
      column: "slug",
      type: "slug",
      derivedFrom: "description",
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
      label: "Season",
      column: "season_id",
      type: "lookup",
      lookup: {
        table: "season",
        labelColumn: "description",
      },
    },
  ],
};

export default episodeOrm;
