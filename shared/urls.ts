import { getPluralTableName } from "@/shared/tableNames";

export function getEditUrl(table: string, id?: number) {
  // Replace _ with -
  table = table.replace("_", "-");

  let url = `/edit/${getPluralTableName(table)}`;

  if (id) {
    url += `/${id}`;
  }

  return url;
}
