import { TableOrm } from "../tableOrmTypes";

const sketchOrm: TableOrm = {
  name: "sketch",
  label: "Sketch",
  fields: [
    {
      label: "Title",
      column: "title",
      type: "string",
    },
    {
      label: "Slug",
      column: "slug",
      type: "slug",
      derivedFrom: "title",
    },
    {
      label: "Teaser",
      column: "teaser",
      type: "string",
      helperText: "A short one sentence description of the sketch",
    },
    {
      label: "Show",
      column: "show_id",
      type: "lookup",
      lookup: {
        table: "show",
        labelColumn: "name",
      },
    },
    {
      label: "Episode",
      column: "episode_id",
      type: "lookup",
      lookup: {
        table: "episode",
        labelColumn: "description",
      },
    },
    {
      label: "Description",
      column: "description",
      type: "string",
      multiline: true,
    },
    {
      label: "Characters",
      type: "mapping",
      mapping: {
        name: "sketch_participant",
        label: "Sketch Participant",
        fields: [
          {
            label: "Character",
            column: "character_id",
            type: "lookup",
            lookup: {
              table: "character",
              labelColumn: "name",
            },
          },
          {
            label: "Actor",
            column: "person_id",
            type: "lookup",
            lookup: {
              table: "person",
              labelColumn: "name",
            },
          },
          {
            label: "Role",
            column: "role",
            type: "enum",
            enum: "sketch_role_type",
          },
          {
            label: "Description",
            column: "description",
            type: "string",
            multiline: true,
          },
        ],
      },
    },
    {
      label: "Tags",
      type: "mapping",
      mapping: {
        name: "sketch_tag",
        label: "Sketch Tag",
        fields: [
          {
            label: "Tag",
            column: "tag_id",
            type: "lookup",
            lookup: {
              table: "tag",
              labelColumn: "name",
            },
          },
        ],
      },
    },
    {
      label: "Recurring Sketch",
      column: "recurring_sketch_id",
      type: "lookup",
      lookup: {
        table: "recurring_sketch",
        labelColumn: "name",
      },
    },
  ],
};

export default sketchOrm;
