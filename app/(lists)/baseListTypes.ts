import { ListSearchParms } from "@/backend/content/listHelper";
import { getDefaultPageListSize } from "@/shared/ProcessEnv";

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
  const pageSize =
    parseInt(searchParams.pageSize || "0") || getDefaultPageListSize();

  return { ...searchParams, page, pageSize };
}
