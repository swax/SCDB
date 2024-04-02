import { TableOrm } from "../ormTypes";

const personOrm: TableOrm = {
  name: "person",
  label: "Person",
  title: "${person.name}",
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
      optional: true,
    },
  ],
};

export default personOrm;
