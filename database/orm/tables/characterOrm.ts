import { TableOrm } from "../ormTypes";

const characterOrm: TableOrm = {
  name: "character",
  label: "Character",
  title: "${character.name}",
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
      label: "Description",
      column: "description",
      type: "string",
      optional: true,
    },
  ],
};

export default characterOrm;
