import { TableCms } from "../cmsTypes";

const sketchCms: TableCms = {
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
      label: "Preview Image",
      column: "image_id",
      type: "image",
      preview: ["wide"],
      navProp: "image",
    },
    {
      label: "Video URLs",
      column: "video_urls",
      helperText:
        "Supports: YouTube, Vimeo, TikTok, Reddit, Facebook or Internet Archive URLs",
      type: "list",
    },
    {
      label: "Description",
      column: "description",
      type: "string",
      multiline: true,
      optional: true,
    },
    {
      label: "Notes",
      column: "notes",
      type: "string",
      multiline: true,
      optional: true,
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
            label: "Thumbnail",
            column: "image_id",
            type: "image",
            preview: ["square", "wide"],
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
            label: "Character Page",
            column: "character_id",
            type: "lookup",
            lookup: {
              table: "character",
              labelColumn: "name",
            },
            optional: true,
            helperText: "(Optional: If character has their own page)",
          },
          {
            label: "Minor Role (No Lines)",
            column: "minor_role",
            type: "bool",
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
            label: "Cast Role",
            column: "role",
            type: "enum",
            enum: "cast_role_type",
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
      label: "Quotes",
      type: "mapping",
      mappingTable: {
        name: "sketch_quote",
        navProp: "sketch_quotes",
        label: "Quotes",
        inline: true,
        fields: [
          {
            label: "Quote",
            column: "quote",
            type: "string",
            multiline: true,
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
      label: "Link URLs",
      column: "link_urls",
      type: "list",
      optional: true,
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
    {
      label: "Posted on Social Media",
      column: "posted_on_socials",
      type: "bool",
    },
  ],
};

export default sketchCms;
