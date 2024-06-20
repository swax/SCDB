import { TableCms } from "../cmsTypes";

const tagCms: TableCms = {
  name: "tag",
  label: "Tag",
  title: ["${name}"],
  fields: [
    {
      label: "Name",
      column: "name",
      type: "string",
    },
    {
      label: "Description",
      column: "description",
      type: "string",
      multiline: true,
      optional: true,
    },
    {
      label: "Link URLs",
      column: "link_urls",
      type: "list",
      optional: true,
    },
    {
      label: "Category",
      column: "category_id",
      type: "lookup",
      lookup: {
        table: "category",
        labelColumn: "name",
      },
    },
    {
      label: "Lookup Slug",
      column: "lookup_slug",
      type: "string",
      templates: ["${category.name} / ${name}"],
    },
    {
      label: "URL Slug",
      column: "url_slug",
      type: "slug",
      derivedFrom: "lookup_slug",
    },
  ],
};

export default tagCms;
