export function getEditUrl(table: string, id?: number) {
  // Replace _ with -
  table = table.replace("_", "-");

  let url = `/edit/${table}`;

  if (id) {
    url += `/${id}`;
  }

  return url;
}
