import { FieldCms, TableCms } from "../cms/cmsTypes";

/**
 * Convert image-type fields that contain integer values (pre-existing image record IDs)
 * to plain "number" type fields so writeFieldValues treats them as simple FK columns
 * instead of trying to create new image records from CDN keys.
 *
 * The CMS UI passes CDN key strings through image fields, but the API upload workflow
 * creates the image record separately (/upload-image/finish) and passes the resulting
 * image_id integer.
 */
export function convertApiImageFields(table: TableCms) {
  convertImageFieldsInList(table.fields);

  for (const field of table.fields) {
    if (field.type === "mapping") {
      convertImageFieldsInList(field.mappingTable.fields);
    }
  }
}

function convertImageFieldsInList(fields: FieldCms[]) {
  for (const field of fields) {
    if (field.type !== "image") continue;

    const hasIntegerValues = field.values?.some(
      (v) => v !== null && v !== undefined && typeof v === "number",
    );

    if (hasIntegerValues) {
      // Override type so writeFieldChanges sets it as a plain FK column
      (field as unknown as { type: string }).type = "number";
    }
  }
}
