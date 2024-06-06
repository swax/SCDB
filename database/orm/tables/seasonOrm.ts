import { TableOrm } from "../ormTypes";

const seasonOrm: TableOrm = {
  name: "season",
  label: "Season",
  title: ["Season ${number} - ${show.title} ${year}"],
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
      label: "Link URLs",
      column: "link_urls",
      type: "list",
      optional: true,
    },
    {
      label: "Lookup Slug",
      column: "lookup_slug",
      type: "string",
      templates: ["${show.title} ${year}: S${number}"],
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
