import { TableOrm } from "../ormTypes";

const seasonOrm: TableOrm = {
  name: "season",
  label: "Season",
  fields: [
    {
      label: "Show",
      column: "show_id",
      type: "lookup",
      lookup: {
        table: "show",
        labelColumn: "title",
      },
    },
    {
      label: "Year",
      column: "year",
      type: "number",
    },
    {
      label: "Season Number",
      column: "number",
      type: "number",
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
      template: "${season.show.title} ${season.year}: S${season.number}",
    },
    {
      label: "URL Slug",
      column: "url_slug",
      type: "slug",
      derivedFrom: "lookup_slug",
    },
  ],
};

export default seasonOrm;
