import { TableOrm } from "../ormTypes";

const personOrm: TableOrm = {
  name: "person",
  label: "Person",
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
    {
      label: "Images",
      type: "mapping",
      mappingTable: {
        name: "person_image",
        navProp: "person_images",
        label: "Images",
        fields: [
          {
            label: "",
            column: "image_id",
            type: "image",
            navProp: "image",
          },
          {
            label: "Description",
            column: "description",
            type: "string",
            optional: true,
          },
        ],
      },
    },
    {
      label: "Description",
      column: "description",
      type: "string",
      multiline: true,
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
    {
      label: "Deathday",
      column: "death_date",
      type: "date",
      optional: true,
    },
  ],
};

export default personOrm;
