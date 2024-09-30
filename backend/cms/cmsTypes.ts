import { review_status_type } from "@prisma/client";

export type BaseFieldCms = {
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

export type DateFieldCms = BaseFieldCms & {
  type: "date";
  values?: Nullable<Date>[];
};

export type EnumFieldCms = BaseFieldCms & {
  type: "enum";
  enum: string;
  values?: Nullable<string>[];
};

export type LookupFieldCms = BaseFieldCms & {
  type: "lookup";
  values?: Nullable<number>[];
  lookup: {
    /* todo: may want to separate this from the nav prop */
    table: string;
    labelColumn: string;
    labelValues?: Nullable<string>[];
    prefixTemplate?: string[];
    prefixValue?: string;
  };
};

/** The column should be set to the id of the image field */
export type ImageFieldCms = BaseFieldCms & {
  type: "image";
  navProp: string;
  values?: Nullable<string>[];
};

export type MappingTableCms = Omit<TableCms, "title"> & {
  navProp: string;
  /** Undefined or false if a separate dialog is used to edit the mapped fields. Useful for with many fields. */
  inline?: boolean;
  ids?: number[];
  removeIds?: number[];
  resequence?: boolean;
};

export type MappingFieldCms = BaseFieldCms & {
  type: "mapping";
  values?: Nullable<number>[];
  mappingTable: MappingTableCms;
};

export type SlugFieldCms = BaseFieldCms & {
  type: "slug";
  derivedFrom: string;
  values?: Nullable<string>[];
};

export type StringFieldCms = BaseFieldCms & {
  type: "string";
  multiline?: boolean;
  values?: Nullable<string>[];
};

export type ListFieldCms = BaseFieldCms & {
  type: "list";
  multiline?: boolean;
  values?: Nullable<string[]>[];
};

export type NumberFieldCms = BaseFieldCms & {
  type: "number";
  // Maybe do int vs float here
  values?: Nullable<number>[];
};

export type BooleanFieldCms = BaseFieldCms & {
  type: "bool";
  // Maybe do int vs float here
  values?: Nullable<boolean>[];
};

export type FieldCms =
  | DateFieldCms
  | EnumFieldCms
  | LookupFieldCms
  | MappingFieldCms
  | SlugFieldCms
  | StringFieldCms
  | NumberFieldCms
  | ListFieldCms
  | ImageFieldCms
  | BooleanFieldCms;

export type FieldCmsValueType = NonNullable<FieldCms["values"]>[number];

// TODO: Maybe rename to 'Row' would make more sense?
export type TableCms = {
  /** Name of the table in Postgres */
  name: string;
  /** Name of the table in the UI */
  label: string;
  /** Title used for the webpage */
  title: string[];
  operation?: "create" | "update";
  fields: FieldCms[];
  reviewStatus?: review_status_type;
};

export type DatabaseCms = {
  [key: string]: TableCms;
};

export function isFieldEmpty(field: FieldCms, index: number) {
  // Can't set value at the beginning here because the type guard won't work
  if (field.type == "list") {
    const list = field.values?.[index];
    return !list || list.length == 0;
  } else if (field.type == "bool") {
    const bool = field.values?.[index];
    return bool !== true && bool !== false;
  } else if (field.type == "number") {
    const number = field.values?.[index];
    return isNaN(parseInt(`${number}`));
  } else {
    const value = field.values?.[index];
    return !value;
  }
}
