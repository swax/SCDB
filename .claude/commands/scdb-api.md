Access the SCDB REST API using configured API keys.

IMPORTANT: Never read .env.scdb with the Read tool — that exposes API keys.
Always source it inline with bash commands.

All curl commands follow this pattern:
source .claude/commands/.env.scdb && curl -sS -L -H "Authorization: Bearer $SCDB_API_KEY" "$SCDB_API_URL/<path>" | jq

If the curl fails because .env.scdb is missing or the key is empty, tell the user:
"Copy .claude/commands/.env.scdb.example to .claude/commands/.env.scdb and add your API URL and key."

The API has one HATEOAS entry point:

- $SCDB_API_URL/ — returns \_links to all available resources and actions

Always start by fetching the entry point to discover available endpoints from \_links.

Visiting a resource endpoint with no query parameters returns \_actions describing
available operations (list, create, read, update, delete) with schema references.

Use GET to explore, POST/PUT/DELETE for mutations. Auth is only required for mutations.

User's request: $ARGUMENTS
