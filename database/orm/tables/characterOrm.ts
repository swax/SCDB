import { TableOrm } from "../ormTypes";

const characterOrm: TableOrm = {
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
      label: "Real Person",
      column: "person_id",
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
      type: "string",
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

export default characterOrm;
