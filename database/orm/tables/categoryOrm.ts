import { TableOrm } from "../ormTypes";

const categoryOrm: TableOrm = {
  name: "category",
  label: "Category",
  title: ["${name}"],
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
  ],
};

export default categoryOrm;
