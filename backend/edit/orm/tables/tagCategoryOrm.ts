import { TableOrm } from "../tableOrmTypes";

const tagCategoryOrm: TableOrm = {
  name: "tag_category",
  label: "Tag Category",
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
  ],
};

export default tagCategoryOrm;
