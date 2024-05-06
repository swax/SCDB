import { FieldOrm } from "@/database/orm/ormTypes";
import prisma from "@/database/prisma";
import { operation_type } from "@prisma/client";

interface ChangelogEntry {
  id: number;
  changed_at: Date;
  modified_fields: FieldOrm[];
  table_name: string;
  row_id: string;
  operation: string;
  changed_by: {
    username: string;
  };
  summary?: string;
}

interface GetChangelogRequest {
  operation?: string;
  page: number;
  rowId?: string;
  rowsPerPage: number;
  tableName?: string;
  username?: string;
}

export interface GetChangelogResponse {
  total: number;
  entries: ChangelogEntry[];
}

export async function getChangelog({
  operation,
  page,
  rowId,
  rowsPerPage,
  tableName,
  username,
}: GetChangelogRequest) {
  const whereFilter = {
    where: {
      ...(operation
        ? { operation: operation.toUpperCase() as operation_type }
        : {}),
      ...(tableName ? { table_name: tableName } : {}),
      ...(rowId ? { row_id: rowId } : {}),
      ...(username
        ? {
            changed_by: {
              username,
            },
          }
        : {}),
    },
  };

  // Get total
  const total = await prisma.audit.count(whereFilter);

  // Get entries
  const entries = (await prisma.audit.findMany({
    ...whereFilter,
    select: {
      id: true,
      changed_at: true,
      table_name: true,
      row_id: true,
      operation: true,
      modified_fields: true,
      changed_by: {
        select: {
          username: true,
        },
      },
    },
    skip: (page - 1) * rowsPerPage,
    take: rowsPerPage,
    orderBy: {
      id: "desc",
    },
  })) as ChangelogEntry[];

  // Write summary
  entries.forEach((entry) => {
    entry.summary = entry.modified_fields
      ?.flatMap((f) => {
        const changes: string[] = [];

        if (f.type == "mapping") {
          changes.push(`${f.label}:`);
          f.mappingTable.fields.map((mf) => {
            changes.push(`  ${mf.label}: ${getValueString(mf.values)}`);
          });
          if (f.mappingTable.removeIds) {
            changes.push(`  Removed: ${f.mappingTable.removeIds.join(", ")}`);
          }
        } else {
          changes.push(`${f.label}: ${getValueString(f.values)}`);
        }

        return changes.join("\n");
      })
      .join("\n");
  });

  return { total, entries } satisfies GetChangelogResponse;
}

function getValueString(values?: any[]) {
  if (!values) {
    return "<none>";
  }

  return values
    .map((v) => {
      if (v === null) {
        return "<null>";
      } else if (v === undefined) {
        return "<undefined>";
      } else if (v === "") {
        return "<empty string>";
      }
      if (typeof v == "string") {
        return v;
      } else if (Array.isArray(v)) {
        return v.join(", ");
      } else {
        return JSON.stringify(v);
      }
    })
    .join(" / ");
}
