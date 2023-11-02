export type BaseEditField = {
  name: string;
  column?: string;
  helperText?: string;
  values?: unknown[];
  modified?: boolean[];
};

export type EnumEditField = BaseEditField & {
  type: "enum";
  enum: string;
};

export type StringEditField = BaseEditField & {
  type: "string";
  multiline?: boolean;
};

export type LookupEditField = BaseEditField & {
  type: "lookup";
  lookup: {
    table: string;
    column: string;
    values?: string[];
  };
};

export type MappingEditField = BaseEditField & {
  type: "mapping";
  mapping: {
    table: string;
    ids?: number[];
    removeIds?: number[];
    fields: TableEditField[];
  };
};

export type SlugEditField = BaseEditField & {
  type: "slug";
  derivedFrom: string;
};

export type TableEditField =
  | EnumEditField
  | LookupEditField
  | MappingEditField
  | SlugEditField
  | StringEditField;

export type TableEditConfig = {
  table: string;
  operation?: "create" | "update";
  fields: TableEditField[];
};

export type TableEditConfigs = {
  [key: string]: TableEditConfig;
};
