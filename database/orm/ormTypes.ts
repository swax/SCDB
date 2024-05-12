import { review_status_type } from "@prisma/client";

export type BaseFieldOrm = {
  label: string;
  column?: string;
  helperText?: string;
  optional?: boolean;
  /** Mutliple templates can be defined as fallbacks if properties are undefined */
  templates?: string[];
  modified?: boolean[];
  /** In a mapping table, this is the field you want to take the max width,
   * which pushes the edit/delete buttons over to the far right */
  fillWidth?: boolean;

  // virtual values - each type defines its own values
  // For mapping table types there can be more than one value
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
    /* todo: may want to separate this from the nav prop */
    table: string;
    labelColumn: string;
    labelValues?: Nullable<string>[];
  };
};

/** The column should be set to the id of the image field */
export type ImageFieldOrm = BaseFieldOrm & {
  type: "image";
  navProp: string;
  values?: Nullable<string>[];
};

export type MappingTableOrm = Omit<TableOrm, "title"> & {
  navProp: string;
  /** Undefined or false if a separate dialog is used to edit the mapped fields. Useful for with many fields. */
  inline?: boolean;
  ids?: number[];
  removeIds?: number[];
  resequence?: boolean;
};

export type MappingFieldOrm = BaseFieldOrm & {
  type: "mapping";
  values?: Nullable<number>[];
  mappingTable: MappingTableOrm;
};

export type SlugFieldOrm = BaseFieldOrm & {
  type: "slug";
  derivedFrom: string;
  values?: Nullable<string>[];
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
  | MappingFieldOrm
  | SlugFieldOrm
  | StringFieldOrm
  | NumberFieldOrm
  | ListFieldOrm
  | ImageFieldOrm;

// TODO: Maybe rename to 'Row' would make more sense?
export type TableOrm = {
  /** Name of the table in Postgres */
  name: string;
  /** Name of the table in the UI */
  label: string;
  /** Title used for the webpage */
  title: string[];
  operation?: "create" | "update";
  fields: FieldOrm[];
  reviewStatus?: review_status_type;
};

export type DatabaseOrm = {
  [key: string]: TableOrm;
};
