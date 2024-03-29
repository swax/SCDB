import { TableEditConfig } from "./tableEditTypes";

const sketchConfig: TableEditConfig = {
  table: "sketch",
  name: "Sketch",
  fields: [
    {
      name: "Title",
      column: "title",
      type: "string",
    },
    {
      name: "Slug",
      column: "slug",
      type: "slug",
      derivedFrom: "title",
    },
    {
      name: "Teaser",
      column: "teaser",
      type: "string",
      helperText: "A short one sentence description of the sketch",
    },
    {
      name: "Show",
      column: "show_id",
      type: "lookup",
      lookup: {
        table: "show",
        column: "name",
      },
    },
    {
      name: "Episode",
      column: "episode_id",
      type: "lookup",
      lookup: {
        table: "episode",
        column: "description",
      },
    },
    {
      name: "Description",
      column: "description",
      type: "string",
      multiline: true,
    },
    {
      name: "Characters",
      type: "mapping",
      mapping: {
        table: "sketch_participant",
        name: "Sketch Participant",
        fields: [
          {
            name: "Character",
            column: "character_id",
            type: "lookup",
            lookup: {
              table: "character",
              column: "name",
            },
          },
          {
            name: "Actor",
            column: "person_id",
            type: "lookup",
            lookup: {
              table: "person",
              column: "name",
            },
          },
          {
            name: "Role",
            column: "role",
            type: "enum",
            enum: "sketch_role_type",
          },
          {
            name: "Description",
            column: "description",
            type: "string",
            multiline: true,
          },
        ],
      },
    },
    {
      name: "Tags",
      type: "mapping",
      mapping: {
        table: "sketch_tag",
        name: "Sketch Tag",
        fields: [
          {
            name: "Tag",
            column: "tag_id",
            type: "lookup",
            lookup: {
              table: "tag",
              column: "name",
            },
          },
        ],
      },
    },
    {
      name: "Recurring Sketch",
      column: "recurring_sketch_id",
      type: "lookup",
      lookup: {
        table: "recurring_sketch",
        column: "name",
      },
    },
  ],
};

export default sketchConfig;
