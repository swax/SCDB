export interface ListSearchParms {
  page: number;
  pageSize: number;
  sortField?: string;
  sortDir?: "asc" | "desc" | null;
  filterField?: string;
  filterValue?: string;
  filterOp?: string;
  search?: string;
  hiddenColumns?: string;
  extraWhere?: Record<string, unknown>;
}

/** Return type for getBaseFindParams – keeps Prisma happy via type assertions downstream */
export interface BaseFindParams {
  where: Record<string, unknown> | undefined;
  orderBy: Record<string, unknown> | undefined;
  skip: number;
  take: number;
}

export function getBaseFindParams(
  searchParams: ListSearchParms,
  searchFields?: string[],
): BaseFindParams {
  const orderBy = getOrderParams(searchParams);

  const where = getWhereParams(searchParams, searchFields);

  const { page, pageSize } = searchParams;

  return {
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

function getOrderParams({ sortField, sortDir }: ListSearchParms) {
  if (!sortField || !sortDir) {
    return undefined;
  }

  const [relatedTable, relatedField] = sortField.split("__");

  if (relatedField) {
    return {
      [relatedTable]: {
        [relatedField]: sortDir,
      },
    };
  } else {
    return {
      [sortField]: sortDir,
    };
  }
}

function getWhereParams(
  { filterField, filterValue, filterOp, search, extraWhere }: ListSearchParms,
  searchFields?: string[],
): Record<string, unknown> | undefined {
  const conditions: Record<string, unknown>[] = [];

  // Handle search across multiple fields
  if (search && searchFields && searchFields.length > 0) {
    const searchConditions = searchFields.map((field) => {
      const [relatedTable, relatedField] = field.split("__");

      if (relatedField) {
        return {
          [relatedTable]: {
            [relatedField]: {
              contains: search,
              mode: "insensitive",
            },
          },
        };
      } else {
        return {
          [field]: {
            contains: search,
            mode: "insensitive",
          },
        };
      }
    });

    conditions.push({ OR: searchConditions });
  }

  // Handle column filter
  if (filterField && filterValue && filterOp) {
    let filter:
      | Record<string, string | number | Date | Date[]>
      | string
      | boolean
      | number = {};
    const numValue = parseInt(filterValue);
    const dateValue = new Date(filterValue);

    if (filterOp == "contains") {
      filter = {
        contains: filterValue,
        mode: "insensitive",
      };
    } else if (filterOp == "startsWith") {
      filter = {
        startsWith: filterValue,
        mode: "insensitive",
      };
    } else if (filterOp == "endsWith") {
      filter = {
        endsWith: filterValue,
        mode: "insensitive",
      };
    } else if (filterOp == "equals") {
      filter = filterValue;
    } else if (filterOp == "=") {
      filter = numValue;
    } else if (filterOp == "!=") {
      filter["not"] = numValue;
    } else if (filterOp == ">") {
      filter["gt"] = numValue;
    } else if (filterOp == ">=") {
      filter["gte"] = numValue;
    } else if (filterOp == "<") {
      filter["lt"] = numValue;
    } else if (filterOp == "<=") {
      filter["lte"] = numValue;
    } else if (filterOp == "is") {
      if (filterValue === "true") {
        filter = true;
      } else if (filterValue === "false") {
        filter = false;
      } else if (!isNaN(dateValue.getTime())) {
        // Valid date - trying to match on just the date not the time
        const endDate = new Date(dateValue);
        endDate.setDate(dateValue.getDate() + 1);
        filter["in"] = [dateValue, endDate];
      } else {
        // Not a boolean or date, treat as string equality (for enums)
        filter = filterValue;
      }
    } else if (filterOp == "after") {
      filter["gt"] = dateValue;
    } else if (filterOp == "onOrAfter") {
      filter["gte"] = dateValue;
    } else if (filterOp == "before") {
      filter["lt"] = dateValue;
    } else if (filterOp == "onOrBefore") {
      filter["lte"] = dateValue;
    }

    const [relatedTable, relatedField] = filterField.split("__");

    if (relatedField) {
      conditions.push({
        [relatedTable]: {
          [relatedField]: filter,
        },
      });
    } else {
      conditions.push({
        [filterField]: filter,
      });
    }
  }

  // Handle extra where conditions (entity-specific filters like show_id, number)
  if (extraWhere) {
    conditions.push(extraWhere);
  }

  // Return combined conditions
  if (conditions.length === 0) {
    return undefined;
  } else if (conditions.length === 1) {
    return conditions[0];
  } else {
    return { AND: conditions };
  }
}
