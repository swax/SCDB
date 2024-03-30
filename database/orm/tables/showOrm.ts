import { TableOrm } from "../ormTypes";

const showOrm: TableOrm = {
  name: "show",
  label: "Show",
  fields: [
    {
      label: "Name",
      column: "name",
      type: "string",
    },
    {
      label: "Description",
      column: "description",
      type: "string",
    },
    {
      label: "Slug",
      column: "slug",
      type: "slug",
      derivedFrom: "name",
    },
  ],
};

export default showOrm;
