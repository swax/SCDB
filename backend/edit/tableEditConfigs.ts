type TableEditFieldType =
  | "boolean"
  | "enum"
  | "lookup"
  | "mapping"
  | "number"
  | "string";

export interface TableLookupField {
  table: string;
  column: string;
  values?: string[];
}

export interface TableEditField {
  name: string;
  column?: string;
  type: TableEditFieldType;
  helperText?: string;
  values?: unknown[];
  modified?: boolean[];
  lookup?: TableLookupField;
  mapping?: {
    table: string;
    ids?: number[];
    removeIds?: number[];
    fields: TableEditField[];
  };
  enum?: string;
}

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
        name: "Recurring Sketch",
        column: "recurring_sketch_id",
        type: "lookup",
        lookup: {
          table: "recurring_sketch",
          column: "name",
        },
      },
      {
        name: "Tags",
        type: "mapping",
        mapping: {
          table: "sketch_tag",
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
        name: "Participants",
        type: "mapping",
        mapping: {
          table: "sketch_participant",
          fields: [
            {
              name: "Person",
              column: "person_id",
              type: "lookup",
              lookup: {
                table: "person",
                column: "name",
              },
            },
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
              name: "Role",
              column: "role",
              type: "enum",
              enum: "sketch_role_type",
            },
            {
              name: "Description",
              column: "description",
              type: "string",
            },
          ],
        },
      },
    ],
  },
};

Object.freeze(tableEditConfigs); // Doesn't seem to prevent modification like it should

export default tableEditConfigs;
