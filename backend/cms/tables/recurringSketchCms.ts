import { TableCms } from "../cmsTypes";

const recurringSketch: TableCms = {
  name: "recurring_sketch",
  label: "Recurring Sketch",
  title: ["${title} - ${show.title}"],
  fields: [
    {
      label: "Title",
      column: "title",
      type: "string",
    },
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
      templates: ["${show.title}: ${title}"],
    },
    {
      label: "URL Slug",
      column: "url_slug",
      type: "slug",
      derivedFrom: "lookup_slug",
    },
  ],
};

export default recurringSketch;
