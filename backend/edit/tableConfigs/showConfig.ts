import { TableEditConfig } from "./tableEditTypes";

const showConfig: TableEditConfig = {
  table: "show",
  fields: [
    {
      name: "Name",
      column: "name",
      type: "string",
    },
    {
      name: "Description",
      column: "description",
      type: "string",
    },
    {
      name: "Slug",
      column: "slug",
      type: "slug",
      derivedFrom: "name",
    },
  ],
};

export default showConfig;
