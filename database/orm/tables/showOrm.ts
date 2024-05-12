import { TableOrm } from "../ormTypes";

const showOrm: TableOrm = {
  name: "show",
  label: "Show",
  title: ["${title}"],
  fields: [
    {
      label: "Title",
      column: "title",
      type: "string",
    },
    {
      label: "Description",
      column: "description",
      type: "string",
      optional: true,
    },
    {
      label: "URL Slug",
      column: "url_slug",
      type: "slug",
      derivedFrom: "title",
    },
  ],
};

export default showOrm;
