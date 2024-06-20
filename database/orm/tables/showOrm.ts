import { TableCms } from "../ormTypes";

const showCms: TableCms = {
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
      label: "Link URLs",
      column: "link_urls",
      type: "list",
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

export default showCms;
