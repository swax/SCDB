Access the SCDB PostgreSQL database directly.

Run queries using:
psql service=scdb -c "..."

The database schema is defined in database/schema.prisma — read it to understand
tables, columns, relations, and enums before writing queries.

Prisma model names map to snake_case table names (e.g. `sketch_cast`, `sketch_credit`).
Prisma `@map` annotations show the actual column names when they differ from the field names.

Use SELECT for reads. For mutations, confirm with the user first.
When inserting or updating rows that require a user ID (created_by_id, modified_by_id),
source the env file and use $SCDB_USER_ID:
source .claude/commands/.env.scdb && psql service=scdb -c "..."

User's request: $ARGUMENTS
