import { TableEditConfig } from "./tableEditTypes";

const characterConfig: TableEditConfig = {
  table: "character",
  name: "Character",
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
    {
      name: "Description",
      column: "description",
      type: "string",
    },
  ],
};

export default characterConfig;
