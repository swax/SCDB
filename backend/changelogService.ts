import { FieldOrm } from "@/database/orm/ormTypes";
import prisma from "@/database/prisma";

export interface ChangelogEntry {
  id: number;
  changed_at: Date;
  modified_fields: FieldOrm[];
  changed_by: {
    name: string;
  };
  summary?: string;
}

export async function getChangelog(userid?: string) {
  const changelog = (await prisma.audit.findMany({
    where: userid
      ? {
          changed_by_id: userid,
        }
      : {},
    take: 20,
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      changed_at: true,
      modified_fields: true,
      changed_by: {
        select: {
          name: true,
        },
      },
    },
  })) as ChangelogEntry[];

  changelog.forEach((entry) => {
    entry.summary = entry.modified_fields
      ?.flatMap((f) => {
        const changes: string[] = [];

        if (f.type == "mapping") {
          changes.push(`${f.label}:`);
          f.mappingTable.fields.map((mf) => {
            changes.push(`  ${mf.label}: ${mf.values?.join(", ")}`);
          });
          if (f.mappingTable.removeIds) {
            changes.push(`  Removed: ${f.mappingTable.removeIds.join(", ")}`);
          }
        } else {
          changes.push(`${f.label}: ${f.values?.join(", ")}`);
        }

        return changes.join("\n");
      })
      .join("\n");
  });

  return changelog;
}
