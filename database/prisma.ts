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
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create the PostgreSQL adapter
const adapter = new PrismaPg({
  connectionString: ProcessEnv.DATABASE_POOLED_URL || ProcessEnv.DATABASE_URL || "",
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
