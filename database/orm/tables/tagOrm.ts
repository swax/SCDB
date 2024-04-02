import { TableOrm } from "../ormTypes";

const tagOrm: TableOrm = {
  name: "tag",
  label: "Tag",
  title: "${tag.name}",
  fields: [
    {
      label: "Name",
      column: "name",
      type: "string",
    },
    {
      label: "URL Slug",
      column: "url_slug",
      type: "slug",
      derivedFrom: "name",
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
  ],
};

export default tagOrm;
