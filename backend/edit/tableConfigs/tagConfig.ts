import { TableEditConfig } from "./tableEditTypes";

const tagConfig: TableEditConfig = {
  table: "tag",
  fields: [
    {
      name: "Name",
      column: "name",
      type: "string",
    },
    {
      name: "Slug",
      column: "slug",
      type: "slug",
      derivedFrom: "name",
    },
    {
      name: "Category",
      column: "tag_category_id",
      type: "lookup",
      lookup: {
        table: "tag_category",
        column: "name",
      },
    },
  ],
};

export default tagConfig;
