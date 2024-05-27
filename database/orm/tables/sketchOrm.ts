import { TableOrm } from "../ormTypes";

const sketchOrm: TableOrm = {
  name: "sketch",
  label: "Sketch",
  title: [
    "${title} - ${episode.lookup_slug}",
    "${title} - ${season.lookup_slug}",
    "${title} - ${show.title}",
  ],
  fields: [
    {
      label: "Title",
      column: "title",
      type: "string",
    },
    {
      label: "Show",
      column: "show_id",
      type: "lookup",
      lookup: {
        table: "show",
        labelColumn: "title",
      },
    },
    {
      label: "Season",
      column: "season_id",
      type: "lookup",
      lookup: {
        table: "season",
        labelColumn: "lookup_slug",
        prefixTemplate: ["${show.title}"],
      },
      optional: true,
    },
    {
      label: "Episode",
      column: "episode_id",
      type: "lookup",
      lookup: {
        table: "episode",
        labelColumn: "lookup_slug",
        prefixTemplate: ["${season.lookup_slug}", "${show.title}"],
      },
      optional: true,
    },
    {
      label: "Images",
      type: "mapping",
      mappingTable: {
        name: "sketch_image",
        navProp: "sketch_images",
        label: "Images",
        fields: [
          {
            label: "",
            column: "image_id",
            type: "image",
            navProp: "image",
          },
        ],
      },
    },
    {
      label: "Video URLs",
      column: "video_urls",
      helperText: "Supports: YouTube, Vimeo, TikTok, or Internet Archive",
      type: "list",
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
        labelColumn: "lookup_slug",
      },
    },
    {
      label: "Cast",
      type: "mapping",
      mappingTable: {
        name: "sketch_cast",
        navProp: "sketch_casts",
        label: "Cast",
        fields: [
          {
            label: "",
            column: "image_id",
            type: "image",
            navProp: "image",
            optional: true,
          },
          {
            label: "Character Name",
            column: "character_name",
            type: "string",
            optional: true,
          },
          {
            label: "Recurring Character",
            column: "character_id",
            type: "lookup",
            lookup: {
              table: "character",
              labelColumn: "name",
            },
            optional: true,
          },
          {
            label: "Actor",
            column: "person_id",
            type: "lookup",
            optional: true,
            lookup: {
              table: "person",
              labelColumn: "name",
            },
          },
          {
            label: "Role",
            column: "role",
            type: "enum",
            enum: "cast_role_type",
          },
          {
            label: "Description",
            column: "description",
            type: "string",
            multiline: true,
            optional: true,
            fillWidth: true,
          },
        ],
      },
    },
    {
      label: "Credits",
      type: "mapping",
      mappingTable: {
        name: "sketch_credit",
        navProp: "sketch_credits",
        label: "Credits",
        fields: [
          {
            label: "Name",
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
            enum: "credit_role_type",
          },
          {
            label: "Description",
            column: "description",
            type: "string",
            multiline: true,
            optional: true,
            fillWidth: true,
          },
        ],
      },
    },
    {
      label: "Tags",
      type: "mapping",
      mappingTable: {
        name: "sketch_tag",
        navProp: "sketch_tags",
        label: "Tags",
        inline: true,
        fields: [
          {
            label: "Name",
            column: "tag_id",
            type: "lookup",
            fillWidth: true,
            lookup: {
              table: "tag",
              labelColumn: "lookup_slug",
            },
          },
        ],
      },
    },
    {
      label: "Lookup Slug",
      column: "lookup_slug",
      type: "string",
      // Fallback templates as season/episode may not always be defined
      templates: [
        "${episode.lookup_slug}: ${title}",
        "${season.lookup_slug}: ${title}",
        "${show.title}: ${title}",
      ],
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
