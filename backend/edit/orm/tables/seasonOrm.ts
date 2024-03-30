import { TableOrm } from "../tableOrmTypes";

const seasonOrm: TableOrm = {
  name: "season",
  label: "Season",
  fields: [
    {
      label: "Season Number",
      column: "number",
      type: "number",
    },
    {
      label: "Year",
      column: "year",
      type: "number",
    },
    {
      label: "Description",
      column: "description",
      type: "string",
      template:
        "${season.show.name} - Season ${season.number} (${season.year})",
    },
    {
      label: "Slug",
      column: "slug",
      type: "slug",
      derivedFrom: "description",
    },
    {
      label: "Show",
      column: "show_id",
      type: "lookup",
      lookup: {
        table: "show",
        labelColumn: "name",
      },
    },
  ],
};

export default seasonOrm;
