import { ListSearchParms } from "@/backend/content/listHelper";
import { getDefaultPageListSize } from "@/shared/ProcessEnv";
import { unstable_cache } from "next/cache";

export interface ListPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortField?: string;
    sortDir?: "asc" | "desc";
    filterField?: string;
    filterValue?: string;
  }>;
}

export async function parseSearchParams(
  searchParams: ListPageProps["searchParams"],
): Promise<ListSearchParms> {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1");
  const pageSize =
    parseInt(resolvedParams.pageSize || "0") || getDefaultPageListSize();

  return { ...resolvedParams, page, pageSize };
}

export function getCachedList<T>(
  table: string,
  getList: (params: ListSearchParms, id?: number) => Promise<T>,
) {
  // Returns back a function, when called with the searchParams,
  // they are stringified and appended to the cache key to make it unique
  return unstable_cache(
    async (params: ListSearchParms, id?: number) => getList(params, id),
    [table],
    {
      revalidate: 300,
      tags: [`${table}-list`],
    },
  );
}
