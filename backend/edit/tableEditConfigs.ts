export interface TableEditField {
  name: string;
  column: string;
  type: string;
  helperText?: string;
  originalValue?: unknown;
  newValue?: unknown;
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
    ],
  },
};

Object.freeze(tableEditConfigs); // Doesn't seem to prevent modification like it should

export default tableEditConfigs;
