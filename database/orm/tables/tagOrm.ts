import { TableOrm } from "../ormTypes";

const tagOrm: TableOrm = {
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
      label: "Category",
      column: "tag_category_id",
      type: "lookup",
      lookup: {
        table: "tag_category",
        labelColumn: "name",
      },
    },
    {
      label: "Lookup Slug",
      column: "lookup_slug",
      type: "string",
      templates: ["${tag_category.name} / ${name}"],
    },
    {
      label: "URL Slug",
      column: "url_slug",
      type: "slug",
      derivedFrom: "lookup_slug",
    },
  ],
};

export default tagOrm;
