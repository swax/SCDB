import { TableEditConfig } from "./tableEditTypes";

const tagCategoryConfig: TableEditConfig = {
  table: "tag_category",
  name: "Tag Category",
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
  ],
};

export default tagCategoryConfig;
