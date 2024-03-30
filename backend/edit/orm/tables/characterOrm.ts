import { TableOrm } from "../tableOrmTypes";

const characterOrm: TableOrm = {
  name: "character",
  label: "Character",
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
    {
      label: "Description",
      column: "description",
      type: "string",
    },
  ],
};

export default characterOrm;
