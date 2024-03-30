import { TableOrm } from "../ormTypes";

const personOrm: TableOrm = {
  name: "person",
  label: "Person",
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
    {
      label: "Gender",
      column: "gender",
      type: "enum",
      enum: "gender_type",
    },
    {
      label: "Birthday",
      column: "birth_date",
      type: "date",
    },
  ],
};

export default personOrm;
