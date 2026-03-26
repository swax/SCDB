import prisma from "@/database/prisma";
import { gender_type, review_status_type } from "@/shared/enums";
import { FieldCmsValueType, TableCms } from "../cms/cmsTypes";
import { findAndBuildTableCms } from "../edit/editReadService";
import { convertApiImageFields } from "./apiImageHelper";

export interface PersonImageInput {
  image_id: number;
  description?: string | null;
}

export interface PersonInput {
  name?: string;
  description?: string | null;
  gender?: gender_type;
  birth_date?: string | null;
  death_date?: string | null;
  link_urls?: string[] | null;
  images?: PersonImageInput[];
}

export function buildPersonTableCms(
  input: PersonInput,
  isUpdate: boolean,
): TableCms {
  const table = findAndBuildTableCms("person");
  table.operation = isUpdate ? "update" : "create";

  for (const field of table.fields) {
    if (!field.column || field.type === "mapping") continue;

    // url_slug is derived from name by updateSlugs() in the write service
    if (field.column === "url_slug") continue;

    const key = field.column as keyof PersonInput;

    if (key in input) {
      let value = input[key] as FieldCmsValueType;

      // Convert date strings to Date objects
      if (field.type === "date" && value) {
        value = new Date(value as string);
      }

      (field as { values: FieldCmsValueType[] }).values = [value];
      field.modified = [true];
    }
  }

  // Handle person_image mapping table
  if (input.images && input.images.length > 0) {
    const mappingField = table.fields.find(
      (f) => f.type === "mapping" && f.mappingTable.name === "person_image",
    );

    if (mappingField && mappingField.type === "mapping") {
      // Each new row gets a negative ID to signal creation
      mappingField.mappingTable.ids = input.images.map((_, i) => -(i + 1));

      for (const item of input.images) {
        for (const field of mappingField.mappingTable.fields) {
          if (field.column === "image_id") {
            field.values ||= [];
            (field.values as FieldCmsValueType[]).push(item.image_id);
            field.modified ||= [];
            field.modified.push(true);
          } else if (field.column === "description") {
            field.values ||= [];
            (field.values as FieldCmsValueType[]).push(
              item.description ?? null,
            );
            field.modified ||= [];
            field.modified.push(true);
          } else {
            field.values ||= [];
            (field.values as FieldCmsValueType[]).push(null);
            field.modified ||= [];
            field.modified.push(false);
          }
        }
      }
    }
  }

  // Convert image fields with integer values to plain FK fields
  convertApiImageFields(table);

  // Mark API content for review
  table.fields.push({
    label: "Review Status",
    column: "review_status",
    type: "enum",
    enum: "review_status_type",
    values: [review_status_type.NeedsReview],
    modified: [true],
  });

  return table;
}

/**
 * For updates, if the images array is provided, delete all existing person_image
 * rows so they get replaced with the new set.
 */
export async function preparePersonMappingReplacements(
  table: TableCms,
  personId: number,
  input: PersonInput,
) {
  if (!("images" in input)) return;

  const mappingField = table.fields.find(
    (f) => f.type === "mapping" && f.mappingTable.name === "person_image",
  );

  if (!mappingField || mappingField.type !== "mapping") return;

  const existingRows = await prisma.person_image.findMany({
    where: { person_id: personId },
    select: { id: true },
  });

  mappingField.mappingTable.removeIds = existingRows.map((r) => r.id);
}
