export type BaseEditField = {
  name: string;
  column?: string;
  helperText?: string;
  values?: unknown[];
  modified?: boolean[];

  multiline?: boolean;
  enum?: string;
};

export type LookupEditField = BaseEditField & {
  type: "lookup";
  details: {
    table: string;
    column: string;
    values?: string[];
  };
};

export type MappingEditField = BaseEditField & {
  type: "mapping";
  details: {
    table: string;
    ids?: number[];
    removeIds?: number[];
    fields: TableEditField[];
  };
};

export type SlugEditField = BaseEditField & {
  type: "slug";
  details: {
    derivedFrom: string;
  };
};

export type SimpleEditField = BaseEditField & {
  type: "boolean" | "enum" | "number" | "string";
};

export type TableEditField =
  | SimpleEditField
  | LookupEditField
  | MappingEditField
  | SlugEditField;

export interface TableEditConfig {
  table: string;
  operation?: "create" | "update";
  fields: TableEditField[];
}

interface TableEditConfigs {
  [key: string]: TableEditConfig;
}

const tableEditConfigs: TableEditConfigs = {
  show: {
    table: "show",
    fields: [
      {
        name: "Name",
        column: "name",
        type: "string",
      },
      {
        name: "Description",
        column: "description",
        type: "string",
      },
      {
        name: "Slug",
        column: "slug",
        type: "slug",
        details: {
          derivedFrom: "name",
        },
      },
    ],
  },
  sketch: {
    table: "sketch",
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
        details: {
          derivedFrom: "title",
        },
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
        details: {
          table: "show",
          column: "name",
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
        details: {
          table: "sketch_participant",
          fields: [
            {
              name: "Character",
              column: "character_id",
              type: "lookup",
              details: {
                table: "character",
                column: "name",
              },
            },
            {
              name: "Actor",
              column: "person_id",
              type: "lookup",
              details: {
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
        details: {
          table: "sketch_tag",
          fields: [
            {
              name: "Tag",
              column: "tag_id",
              type: "lookup",
              details: {
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
        details: {
          table: "recurring_sketch",
          column: "name",
        },
      },
    ],
  },
};

Object.freeze(tableEditConfigs); // Doesn't seem to prevent modification like it should

export default tableEditConfigs;
