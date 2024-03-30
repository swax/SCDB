import { TableOrm } from "../tableOrmTypes";

const tagOrm: TableOrm = {
  name: "tag",
  label: "Tag",
  fields: [
    {
      label: "Name",
      column: "name",
      type: "string",
    },
    {
      label: "Slug",
      column: "slug",
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
