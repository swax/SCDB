import { TableEditConfig } from "./tableEditTypes";

const seasonConfig: TableEditConfig = {
  table: "season",
  name: "Season",
  fields: [
    {
      name: "Season Number",
      column: "number",
      type: "number",
    },
    {
      name: "Year",
      column: "year",
      type: "number",
    },
    {
      name: "Description",
      column: "description",
      type: "string",
      template:
        "${season.show.name} - Season ${season.number} (${season.year})",
    },
    {
      name: "Slug",
      column: "slug",
      type: "slug",
      derivedFrom: "description",
    },
    {
      name: "Show",
      column: "show_id",
      type: "lookup",
      lookup: {
        table: "show",
        column: "name",
      },
    },
  ],
};

export default seasonConfig;
