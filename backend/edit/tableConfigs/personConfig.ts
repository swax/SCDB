import { TableEditConfig } from "./tableEditTypes";

const personConfig: TableEditConfig = {
  table: "person",
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
    {
      name: "Gender",
      column: "gender",
      type: "enum",
      enum: "gender_type",
    },
    {
      name: "Birthday",
      column: "birth_date",
      type: "date",
    },
  ],
};

export default personConfig;
