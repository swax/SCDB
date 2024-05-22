export interface ListSearchParms {
  page: number;
  pageSize: number;
  sortField?: string;
  sortDir?: "asc" | "desc";
  filterField?: string;
  filterValue?: string;
}

export function getBaseFindParams({
  page,
  pageSize,
  sortField,
  sortDir,
}: ListSearchParms) {
  const orderBy = sortField ? { [sortField]: sortDir } : undefined;

  return {
    skip: page * pageSize,
    take: pageSize,
    orderBy,
  };
}
