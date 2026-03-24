import { gender_type, review_status_type } from "@/shared/enums";
import { TableCms } from "../cms/cmsTypes";
import { findAndBuildTableCms } from "../edit/editReadService";

export interface PersonInput {
  name?: string;
  description?: string | null;
  gender?: gender_type;
  birth_date?: string | null;
  death_date?: string | null;
  link_urls?: string[] | null;
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
      let value = input[key] as any;

      // Convert date strings to Date objects
      if (field.type === "date" && value) {
        value = new Date(value);
      }

      field.values = [value];
      field.modified = [true];
    }
  }

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
