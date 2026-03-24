/** Maps singular DB table names (used internally) to plural URL path segments */
const tableToPlural: Record<string, string> = {
  show: "shows",
  season: "seasons",
  episode: "episodes",
  sketch: "sketches",
  person: "people",
  character: "characters",
  tag: "tags",
  category: "categories",
  "recurring-sketch": "recurring-sketches",
  recurring_sketch: "recurring-sketches",
};

/** Maps plural URL path segments to singular DB table names */
const pluralToTable: Record<string, string> = {
  shows: "show",
  seasons: "season",
  episodes: "episode",
  sketches: "sketch",
  people: "person",
  characters: "character",
  tags: "tag",
  categories: "category",
  "recurring-sketches": "recurring-sketch",
};

export function getContentPath(table: string, slug: string): string {
  const plural = tableToPlural[table];
  if (!plural) {
    throw new Error(`Unknown table name: ${table}`);
  }
  return `/${plural}/${slug}`;
}

export function getPluralTableName(table: string): string {
  const plural = tableToPlural[table];
  if (!plural) {
    throw new Error(`Unknown table name: ${table}`);
  }
  return plural;
}

export function getSingularTableName(plural: string): string | undefined {
  return pluralToTable[plural];
}
