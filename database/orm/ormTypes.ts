export type BaseFieldOrm = {
  label: string;
  column?: string;
  helperText?: string;
  optional?: boolean;
  template?: string;
  modified?: boolean[];
  /** In a mapping table, this is the field you want to take the max width, 
   * which pushes the edit/delete buttons over to the far right */
  fillWidth?: boolean;
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
  mappingTable: {
    name: string;
    label: string;
    /** Undefined or false if a separate dialog is used to edit the mapped fields. Useful for with many fields. */
    inline?: boolean;
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

export type ListFieldOrm = BaseFieldOrm & {
  type: "list";
  values?: Nullable<string[]>[];
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
  | NumberFieldOrm
  | ListFieldOrm;

export type TableOrm = {
  /** Name of the table in Postgres */
  name: string;
  /** Name of the table in the UI */
  label: string;
  /** Title used for the webpage */
  title: string;
  operation?: "create" | "update";
  fields: FieldOrm[];
};

export type DatabaseOrm = {
  [key: string]: TableOrm;
};
