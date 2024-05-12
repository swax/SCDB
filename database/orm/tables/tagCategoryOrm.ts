import { TableOrm } from "../ormTypes";

const tagCategoryOrm: TableOrm = {
  name: "tag_category",
  label: "Tag Category",
  title: ["${name}"],
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
  ],
};

export default tagCategoryOrm;
