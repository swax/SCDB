export type BaseFieldOrm = {
  label: string;
  column?: string;
  helperText?: string;
  required?: boolean;
  template?: string;
  modified?: boolean[];
};

export type DateFieldOrm = BaseFieldOrm & {
  type: "date";
  values?: Nullable<Date>[];
};

export type EnumFieldOrm = BaseFieldOrm & {
  type: "enum";
  enum: string;
  values?: Nullable<string>[];
};

export type LookupFieldOrm = BaseFieldOrm & {
  type: "lookup";
  values?: Nullable<number>[];
  lookup: {
    table: string;
    labelColumn: string;
    labelValues?: Nullable<string>[];
  };
};

export type MappingEditField = BaseFieldOrm & {
  type: "mapping";
  values?: Nullable<number>[];
  mapping: {
    name: string;
    label: string;
    ids?: number[];
    removeIds?: number[];
    fields: FieldOrm[];
  };
};

export type SlugFieldOrm = BaseFieldOrm & {
  type: "slug";
  derivedFrom: string;
  values?: Nullable<number>[];
};

export type StringFieldOrm = BaseFieldOrm & {
  type: "string";
  multiline?: boolean;
  values?: Nullable<string>[];
};

export type NumberFieldOrm = BaseFieldOrm & {
  type: "number";
  // Maybe do int vs float here
  values?: Nullable<number>[];
};

export type FieldOrm =
  | DateFieldOrm
  | EnumFieldOrm
  | LookupFieldOrm
  | MappingEditField
  | SlugFieldOrm
  | StringFieldOrm
  | NumberFieldOrm;

export type TableOrm = {
  name: string;
  label: string;
  operation?: "create" | "update";
  fields: FieldOrm[];
};

export type DatabaseOrms = {
  [key: string]: TableOrm;
};
