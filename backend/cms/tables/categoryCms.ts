import { TableCms } from "../cmsTypes";

const categoryCms: TableCms = {
  name: "category",
  label: "Category",
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

export default categoryCms;
