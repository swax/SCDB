import { TableOrm } from "../ormTypes";

const sketchOrm: TableOrm = {
  name: "sketch",
  label: "Sketch",
  fields: [
    {
      label: "Episode",
      column: "episode_id",
      type: "lookup",
      lookup: {
        table: "episode",
        labelColumn: "lookup_slug",
      },
    },
    {
      label: "Title",
      column: "title",
      type: "string",
    },
    {
      label: "Tagline",
      column: "tagline",
      type: "string",
      optional: true,
    },
    {
      label: "Description",
      column: "description",
      type: "string",
      multiline: true,
      optional: true,
    },
    {
      label: "Recurring Sketch",
      column: "recurring_sketch_id",
      type: "lookup",
      optional: true,
      lookup: {
        table: "recurring_sketch",
        labelColumn: "name",
      },
    },
    {
      label: "Characters",
      type: "mapping",
      mappingTable: {
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
      mappingTable: {
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
      label: "Lookup Slug",
      column: "lookup_slug",
      type: "string",
      template: "${sketch.episode.lookup_slug}: ${sketch.title}",
    },
    {
      label: "URL Slug",
      column: "url_slug",
      type: "slug",
      derivedFrom: "lookup_slug",
    },
  ],
};

export default sketchOrm;
