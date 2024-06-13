export interface ListSearchParms {
  page: number;
  pageSize: number;
  sortField?: string;
  sortDir?: "asc" | "desc" | null;
  filterField?: string;
  filterValue?: string;
  filterOp?: string;
}

export function getBaseFindParams(searchParams: ListSearchParms) {
  const orderBy = getOrderParams(searchParams);

  const where = getWhereParams(searchParams);

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

function getWhereParams({
  filterField,
  filterValue,
  filterOp,
}: ListSearchParms) {
  if (!filterField || !filterValue || !filterOp) {
    return undefined;
  }

  let filter:
    | Record<string, string | number | Date | Date[]>
    | string
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
    //filter["equals"] = dateValue;

    // Trying to match on just the date not the time
    const endDate = new Date(dateValue);
    endDate.setDate(dateValue.getDate() + 1);
    filter["in"] = [dateValue, endDate];
  } else if (filterOp == "after") {
    filter["gt"] = dateValue;
  } else if (filterOp == "onOrAfter") {
    filter["gte"] = dateValue;
  } else if (filterOp == "before") {
    filter["lt"] = dateValue;
  } else if (filterOp == "onOrBefore") {
    filter["lte"] = dateValue;
  } else {
    return undefined;
  }

  const [relatedTable, relatedField] = filterField.split("__");

  if (relatedField) {
    return {
      [relatedTable]: {
        [relatedField]: filter,
      },
    };
  } else {
    return {
      [filterField]: filter,
    };
  }
}
