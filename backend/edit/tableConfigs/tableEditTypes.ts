export type BaseEditField = {
  name: string;
  column?: string;
  helperText?: string;
  modified?: boolean[];
};

export type DateEditField = BaseEditField & {
  type: "date";
  values?: Nullable<Date>[];
};

export type EnumEditField = BaseEditField & {
  type: "enum";
  enum: string;
  values?: Nullable<string>[];
};

export type LookupEditField = BaseEditField & {
  type: "lookup";
  values?: Nullable<number>[];
  lookup: {
    table: string;
    column: string;
    values?: string[];
  };
};

export type MappingEditField = BaseEditField & {
  type: "mapping";
  values?: Nullable<number>[];
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
  values?: Nullable<number>[];
};

export type StringEditField = BaseEditField & {
  type: "string";
  multiline?: boolean;
  values?: Nullable<string>[];
};

export type TableEditField =
  | DateEditField
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
