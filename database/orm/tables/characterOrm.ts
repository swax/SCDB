import { TableCms } from "../ormTypes";

const characterCms: TableCms = {
  name: "character",
  label: "Character",
  title: ["${name}"],
  fields: [
    {
      label: "Name",
      column: "name",
      type: "string",
    },
    {
      label: "Person Link",
      column: "person_id",
      helperText:
        "If the character portrays a real person who has also been in sketch comedy, create or link to them here",
      type: "lookup",
      lookup: {
        table: "person",
        labelColumn: "name",
      },
      optional: true,
    },
    {
      label: "Description",
      column: "description",
      multiline: true,
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
      derivedFrom: "name",
    },
  ],
};

export default characterCms;
