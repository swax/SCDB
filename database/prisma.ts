import ProcessEnv from "@/shared/ProcessEnv";
import { PrismaClient } from "@/database/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

declare global {
  // allow global `var` declarations

  var prisma: PrismaClient | undefined;
}

// Create the PostgreSQL adapter
const adapter = new PrismaPg({
  connectionString:
    ProcessEnv.DATABASE_POOLED_URL || ProcessEnv.DATABASE_URL || "",
});

const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    //log: ['query']
    /*    {
                emit: 'event',
                level: 'query'
            }
        ]*/
  });

/*prisma.$on('query', e => {
    console.log('Query: ' + e.query);
    //console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
});*/

if (ProcessEnv.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;

/**
 * Helper for dynamic Prisma model access by table name.
 * Prisma doesn't support typed `prisma[tableName]` so this centralizes
 * the type assertion in one place.
 */
export type DynamicRecord = Record<string, unknown>;

interface DynamicPrismaDelegate {
  findUnique(args: Record<string, unknown>): Promise<DynamicRecord | null>;
  findFirst(args: Record<string, unknown>): Promise<DynamicRecord | null>;
  findMany(args: Record<string, unknown>): Promise<DynamicRecord[]>;
  create(args: Record<string, unknown>): Promise<DynamicRecord>;
  update(args: Record<string, unknown>): Promise<DynamicRecord>;
  delete(args: Record<string, unknown>): Promise<DynamicRecord>;
  deleteMany(args: Record<string, unknown>): Promise<{ count: number }>;
  count(args?: Record<string, unknown>): Promise<number>;
}

export function getPrismaModel(tableName: string): DynamicPrismaDelegate {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  return (prisma as any)[tableName] as DynamicPrismaDelegate;
}
