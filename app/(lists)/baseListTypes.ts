import { ListSearchParms } from "@/backend/content/listHelper";

export interface ListPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    sortField?: string;
    sortDir?: "asc" | "desc";
    filterField?: string;
    filterValue?: string;
  };
}

export function parseSearchParams(
  searchParams: ListPageProps["searchParams"],
): ListSearchParms {
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "30");

  return { ...searchParams, page, pageSize };
}
