/** Recursively resolve $ref strings against the schema registry */
export function resolveSchemaRefs(
  obj: unknown,
  seen = new Set<string>(),
): unknown {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj))
    return obj.map((item) => resolveSchemaRefs(item, seen));

  const record = obj as Record<string, unknown>;

  // Replace { $ref: "SchemaName" } with the referenced schema (inline)
  if (typeof record.$ref === "string" && Object.keys(record).length === 1) {
    const refName = record.$ref;
    if (seen.has(refName)) return { type: "object", description: refName };
    const referenced = schemaRegistry[refName];
    if (referenced) {
      seen.add(refName);
      return resolveSchemaRefs(referenced, seen);
    }
  }

  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    resolved[key] = resolveSchemaRefs(value, seen);
  }
  return resolved;
}

/** JSON Schema definitions for API request/response types, served individually on demand */
export const schemaRegistry: Record<string, object> = {
  PaginationParams: {
    type: "object",
    description:
      "Query parameters for listing/searching resources. " +
      "Pass these as URL query params (e.g. ?search=foo&page=1&pageSize=10).",
    properties: {
      search: {
        type: "string",
        description: "Search by name/title (case-insensitive)",
      },
      page: {
        type: "integer",
        default: 1,
        description: "Page number (default: 1)",
      },
      pageSize: {
        type: "integer",
        default: 30,
        description: "Results per page (default: 30)",
      },
      sortField: {
        type: "string",
        description: "Field to sort by",
      },
      sortDir: {
        type: "string",
        enum: ["asc", "desc"],
        description: "Sort direction",
      },
    },
  },

  SeasonListParams: {
    type: "object",
    description:
      "Query parameters for listing seasons. Supports all standard pagination params " +
      "plus entity-specific filters. Example: ?show_id=1&number=45",
    properties: {
      search: {
        type: "string",
        description: "Search by name/title (case-insensitive)",
      },
      show_id: {
        type: "integer",
        description: "Filter by show ID",
      },
      number: {
        type: "integer",
        description: "Filter by season number",
      },
      year: {
        type: "integer",
        description: "Filter by year",
      },
      page: { type: "integer", default: 1, description: "Page number" },
      pageSize: {
        type: "integer",
        default: 30,
        description: "Results per page",
      },
      sortField: { type: "string" },
      sortDir: { type: "string", enum: ["asc", "desc"] },
    },
  },

  EpisodeListParams: {
    type: "object",
    description:
      "Query parameters for listing episodes. Supports all standard pagination params " +
      "plus entity-specific filters. Example: ?season_id=28&number=11",
    properties: {
      search: {
        type: "string",
        description: "Search by name/title (case-insensitive)",
      },
      season_id: {
        type: "integer",
        description: "Filter by season ID",
      },
      number: {
        type: "integer",
        description: "Filter by episode number",
      },
      page: { type: "integer", default: 1, description: "Page number" },
      pageSize: {
        type: "integer",
        default: 30,
        description: "Results per page",
      },
      sortField: { type: "string" },
      sortDir: { type: "string", enum: ["asc", "desc"] },
    },
  },

  SketchListParams: {
    type: "object",
    description:
      "Query parameters for listing sketches. Supports all standard pagination params " +
      "plus entity-specific filters. Example: ?show_id=1&season_id=28",
    properties: {
      search: {
        type: "string",
        description: "Search by title (case-insensitive)",
      },
      show_id: {
        type: "integer",
        description: "Filter by show ID",
      },
      season_id: {
        type: "integer",
        description: "Filter by season ID",
      },
      episode_id: {
        type: "integer",
        description: "Filter by episode ID",
      },
      recurring_sketch_id: {
        type: "integer",
        description: "Filter by recurring sketch ID",
      },
      page: { type: "integer", default: 1, description: "Page number" },
      pageSize: {
        type: "integer",
        default: 30,
        description: "Results per page",
      },
      sortField: { type: "string" },
      sortDir: { type: "string", enum: ["asc", "desc"] },
    },
  },

  TagListParams: {
    type: "object",
    description:
      "Query parameters for listing tags. Supports all standard pagination params " +
      "plus entity-specific filters. Example: ?category_id=5",
    properties: {
      search: {
        type: "string",
        description: "Search by name (case-insensitive)",
      },
      category_id: {
        type: "integer",
        description: "Filter by category ID",
      },
      page: { type: "integer", default: 1, description: "Page number" },
      pageSize: {
        type: "integer",
        default: 30,
        description: "Results per page",
      },
      sortField: { type: "string" },
      sortDir: { type: "string", enum: ["asc", "desc"] },
    },
  },

  RecurringSketchListParams: {
    type: "object",
    description:
      "Query parameters for listing recurring sketches. Supports all standard pagination params " +
      "plus entity-specific filters. Example: ?show_id=1",
    properties: {
      search: {
        type: "string",
        description: "Search by title (case-insensitive)",
      },
      show_id: {
        type: "integer",
        description: "Filter by show ID",
      },
      page: { type: "integer", default: 1, description: "Page number" },
      pageSize: {
        type: "integer",
        default: 30,
        description: "Results per page",
      },
      sortField: { type: "string" },
      sortDir: { type: "string", enum: ["asc", "desc"] },
    },
  },

  ChecklistPaginationParams: {
    type: "object",
    description:
      "Query parameters for listing checklist items. " +
      "Extends standard pagination with a status filter.",
    properties: {
      search: {
        type: "string",
        description: "Search by sketch title",
      },
      page: {
        type: "integer",
        default: 1,
        description: "Page number (default: 1)",
      },
      pageSize: {
        type: "integer",
        default: 30,
        description: "Results per page (default: 30)",
      },
      sortField: {
        type: "string",
        description: "Field to sort by",
      },
      sortDir: {
        type: "string",
        enum: ["asc", "desc"],
        description: "Sort direction",
      },
      status: {
        type: "string",
        enum: ["Pending", "Added", "NotFound"],
        description: "Filter by checklist item status",
      },
    },
  },

  SketchInput: {
    type: "object",
    description: "Request body for creating a new sketch (POST /sketches)",
    required: ["title", "show_id"],
    properties: {
      title: { type: "string", description: "Sketch title" },
      show_id: {
        type: "integer",
        description: "ID of the show. Use GET /lookup/show to find IDs.",
      },
      season_id: {
        type: "integer",
        nullable: true,
        description: "ID of the season. Use GET /lookup/season to find IDs.",
      },
      episode_id: {
        type: "integer",
        nullable: true,
        description: "ID of the episode. Use GET /lookup/episode to find IDs.",
      },
      recurring_sketch_id: {
        type: "integer",
        nullable: true,
        description: "ID of the recurring sketch, if applicable.",
      },
      video_urls: {
        type: "array",
        items: { type: "string" },
        description:
          "Video URLs (YouTube, Vimeo, TikTok, Reddit, Facebook, Internet Archive)",
      },
      teaser: {
        type: "string",
        nullable: true,
        description: "Short teaser text",
      },
      synopsis: {
        type: "string",
        nullable: true,
        description: "Full synopsis of the sketch",
      },
      notes: {
        type: "string",
        nullable: true,
        description: "Additional notes",
      },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
        description: "Related external links",
      },
      image_id: {
        type: "integer",
        nullable: true,
        description:
          "ID of the preview image. Upload via /upload-image/begin + /upload-image/finish first.",
      },
      posted_on_socials: {
        type: "boolean",
        description:
          "Whether this has been posted on social media (defaults to false)",
      },
      cast: {
        type: "array",
        description: "Cast members in the sketch. See CastInput schema.",
        items: { $ref: "CastInput" },
      },
      credits: {
        type: "array",
        description:
          "Credits (writers, directors, etc.). See CreditInput schema.",
        items: { $ref: "CreditInput" },
      },
      quotes: {
        type: "array",
        description:
          'Memorable quotes. Accepts plain strings: ["quote1", "quote2"] or objects: [{"quote": "quote1"}]',
        items: { oneOf: [{ type: "string" }, { $ref: "QuoteInput" }] },
      },
      tags: {
        type: "array",
        description:
          "Tags for categorization. Accepts plain tag IDs: [123, 456] or objects: [{tag_id: 123}]",
        items: { oneOf: [{ type: "integer" }, { $ref: "SketchTagInput" }] },
      },
    },
  },

  SketchUpdateInput: {
    type: "object",
    description:
      "Request body for updating a sketch (PUT /sketches/{id}). All fields optional. " +
      "Only provided fields are updated. For array fields (cast, credits, quotes, tags), " +
      "providing the array replaces ALL existing entries; omitting leaves them unchanged.",
    properties: {
      title: { type: "string" },
      show_id: { type: "integer" },
      season_id: { type: "integer", nullable: true },
      episode_id: { type: "integer", nullable: true },
      recurring_sketch_id: { type: "integer", nullable: true },
      video_urls: { type: "array", items: { type: "string" } },
      teaser: { type: "string", nullable: true },
      synopsis: { type: "string", nullable: true },
      notes: { type: "string", nullable: true },
      link_urls: { type: "array", items: { type: "string" }, nullable: true },
      image_id: {
        type: "integer",
        nullable: true,
        description:
          "ID of the preview image. Upload via /upload-image/begin + /upload-image/finish first.",
      },
      posted_on_socials: { type: "boolean" },
      cast: {
        type: "array",
        description: "Replaces all existing cast entries",
        items: { $ref: "CastInput" },
      },
      credits: {
        type: "array",
        description: "Replaces all existing credit entries",
        items: { $ref: "CreditInput" },
      },
      quotes: {
        type: "array",
        description:
          'Replaces all existing quotes. Accepts plain strings: ["quote1"] or objects: [{"quote": "quote1"}]',
        items: { oneOf: [{ type: "string" }, { $ref: "QuoteInput" }] },
      },
      tags: {
        type: "array",
        description:
          "Replaces all existing tags. Accepts plain tag IDs: [123] or objects: [{tag_id: 123}]",
        items: { oneOf: [{ type: "integer" }, { $ref: "SketchTagInput" }] },
      },
    },
  },

  CastInput: {
    type: "object",
    description:
      'A cast member entry for a sketch. Example: {"person_id": 489, "character_name": "Kylo Ren", "role": "Host"}',
    required: ["role"],
    properties: {
      image_id: {
        type: "integer",
        nullable: true,
        description:
          "Thumbnail image ID for this cast member. Upload via /upload-image/begin + /upload-image/finish first.",
      },
      character_name: {
        type: "string",
        nullable: true,
        description:
          'Name of the character played (e.g. "Kylo Ren", "Stormtrooper"). This is NOT the actor\'s name.',
      },
      character_id: {
        type: "integer",
        nullable: true,
        description:
          "ID of existing character page (optional). Use GET /lookup/character to find IDs.",
      },
      person_id: {
        type: "integer",
        nullable: true,
        description: "ID of the actor. Use GET /lookup/person to find IDs.",
      },
      role: {
        type: "string",
        enum: ["Cast", "Guest", "Host", "Uncredited"],
        description:
          'Actor\'s role type in the production — NOT the character name. Use "Host" for the episode host, "Cast" for regular/featured cast, "Guest" for guest appearances, "Uncredited" for uncredited roles.',
      },
      minor_role: {
        type: "boolean",
        description: "Whether this is a minor/non-speaking role",
      },
    },
  },

  CreditInput: {
    type: "object",
    description: "A credit entry (writer, director, etc.) for a sketch",
    required: ["person_id", "role"],
    properties: {
      person_id: {
        type: "integer",
        description: "ID of the person. Use GET /lookup/person to find IDs.",
      },
      role: {
        type: "string",
        enum: ["Writer", "Director", "Musician", "Other"],
        description: "Credit role",
      },
      description: {
        type: "string",
        nullable: true,
        description: "Additional description for the credit",
      },
    },
  },

  QuoteInput: {
    type: "object",
    description: "A memorable quote from a sketch",
    required: ["quote"],
    properties: {
      quote: { type: "string", description: "The quote text" },
    },
  },

  SketchTagInput: {
    type: "object",
    description: "A tag entry for a sketch (references an existing tag by ID)",
    required: ["tag_id"],
    properties: {
      tag_id: {
        type: "integer",
        description: "ID of the tag. Use GET /lookup/tag to find IDs.",
      },
    },
  },

  SketchListItem: {
    type: "object",
    description: "Sketch summary returned by GET /sketches",
    properties: {
      id: { type: "integer" },
      title: { type: "string" },
      url_slug: { type: "string" },
      site_rating: { type: "number", nullable: true },
      posted_on_socials: { type: "boolean" },
      review_status: {
        type: "string",
        enum: ["NeedsReview", "Flagged", "Reviewed"],
      },
      show: { type: "object", properties: { title: { type: "string" } } },
      season: {
        type: "object",
        nullable: true,
        properties: { year: { type: "integer" } },
      },
      created_at: { type: "string", format: "date-time" },
    },
  },

  PersonInput: {
    type: "object",
    description: "Request body for creating a new person (POST /people)",
    required: ["name", "gender"],
    properties: {
      name: { type: "string", description: "Full name" },
      description: {
        type: "string",
        nullable: true,
        description: "Bio or description",
      },
      gender: {
        type: "string",
        enum: ["Male", "Female", "Other"],
        description: "Gender",
      },
      birth_date: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Birthday (YYYY-MM-DD)",
      },
      death_date: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Date of death (YYYY-MM-DD)",
      },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
        description: "Related external links (e.g. Wikipedia, IMDb)",
      },
      images: {
        type: "array",
        description:
          "Images for this person. Upload each image via POST /upload-image/direct first to get an image_id.",
        items: { $ref: "PersonImageInput" },
      },
    },
  },

  PersonUpdateInput: {
    type: "object",
    description:
      "Request body for updating a person (PUT /people/{id}). All fields optional. " +
      "Only provided fields are updated. For the images array, providing it replaces ALL " +
      "existing images; omitting leaves them unchanged.",
    properties: {
      name: { type: "string" },
      description: { type: "string", nullable: true },
      gender: { type: "string", enum: ["Male", "Female", "Other"] },
      birth_date: { type: "string", format: "date", nullable: true },
      death_date: { type: "string", format: "date", nullable: true },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
      },
      images: {
        type: "array",
        description: "Replaces all existing person images",
        items: { $ref: "PersonImageInput" },
      },
    },
  },

  PersonListItem: {
    type: "object",
    description: "Person summary returned by GET /people",
    properties: {
      id: { type: "integer" },
      name: { type: "string" },
      url_slug: { type: "string" },
      birth_date: { type: "string", format: "date", nullable: true },
      death_date: { type: "string", format: "date", nullable: true },
      age: { type: "integer", nullable: true },
      _count: {
        type: "object",
        properties: {
          sketch_casts: {
            type: "integer",
            description: "Number of sketches this person appears in",
          },
        },
      },
    },
  },

  ShowInput: {
    type: "object",
    description: "Request body for creating a show (POST /shows)",
    required: ["title"],
    properties: {
      title: { type: "string", description: "Show title" },
      short_name: {
        type: "string",
        nullable: true,
        description: "Short name / abbreviation",
      },
      description: {
        type: "string",
        nullable: true,
        description: "Show description",
      },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
        description: "Related external links",
      },
    },
  },

  SeasonInput: {
    type: "object",
    description: "Request body for creating a season (POST /seasons)",
    required: ["show_id", "year", "number"],
    properties: {
      show_id: {
        type: "integer",
        description: "ID of the show. Use GET /lookup/show to find IDs.",
      },
      year: { type: "integer", description: "Year the season aired" },
      number: { type: "integer", description: "Season number" },
      description: {
        type: "string",
        nullable: true,
        description: "Season description",
      },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
        description: "Related external links",
      },
    },
  },

  EpisodeInput: {
    type: "object",
    description: "Request body for creating an episode (POST /episodes)",
    required: ["season_id", "number"],
    properties: {
      season_id: {
        type: "integer",
        description: "ID of the season. Use GET /lookup/season to find IDs.",
      },
      number: { type: "integer", description: "Episode number" },
      air_date: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Air date (YYYY-MM-DD)",
      },
      title: { type: "string", nullable: true, description: "Episode title" },
      description: {
        type: "string",
        nullable: true,
        description: "Episode description",
      },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
        description: "Related external links",
      },
    },
  },

  RecurringSketchInput: {
    type: "object",
    description:
      "Request body for creating a recurring sketch (POST /recurring-sketches)",
    required: ["title", "show_id"],
    properties: {
      title: { type: "string", description: "Recurring sketch title" },
      show_id: {
        type: "integer",
        description: "ID of the show. Use GET /lookup/show to find IDs.",
      },
      description: {
        type: "string",
        nullable: true,
        description: "Description",
      },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
        description: "Related external links",
      },
    },
  },

  CharacterInput: {
    type: "object",
    description: "Request body for creating a character (POST /characters)",
    required: ["name"],
    properties: {
      name: { type: "string", description: "Character name" },
      person_id: {
        type: "integer",
        nullable: true,
        description:
          "If the character portrays a real person, link to them. Use GET /lookup/person to find IDs.",
      },
      description: {
        type: "string",
        nullable: true,
        description: "Character description",
      },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
        description: "Related external links",
      },
    },
  },

  CategoryInput: {
    type: "object",
    description: "Request body for creating a category (POST /categories)",
    required: ["name"],
    properties: {
      name: { type: "string", description: "Category name" },
    },
  },

  TagInput: {
    type: "object",
    description: "Request body for creating a tag (POST /tags)",
    required: ["name", "category_id"],
    properties: {
      name: { type: "string", description: "Tag name" },
      category_id: {
        type: "integer",
        description:
          "ID of the category. Use GET /lookup/category to find IDs.",
      },
      description: {
        type: "string",
        nullable: true,
        description: "Tag description",
      },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
        description: "Related external links",
      },
    },
  },

  ChecklistInput: {
    type: "object",
    description: "Request body for creating a checklist item (POST /checklist)",
    required: ["show_id", "sketch_title"],
    properties: {
      show_id: {
        type: "integer",
        description: "ID of the show. Use GET /lookup/show to find IDs.",
      },
      season_id: {
        type: "integer",
        nullable: true,
        description: "ID of the season. Use GET /lookup/season to find IDs.",
      },
      episode_id: {
        type: "integer",
        nullable: true,
        description: "ID of the episode. Use GET /lookup/episode to find IDs.",
      },
      sketch_title: {
        type: "string",
        description: "Title of the sketch to add",
      },
      status: {
        type: "string",
        enum: ["Pending", "Added", "NotFound"],
        description: "Checklist item status (default: Pending)",
      },
      video_url: {
        type: "string",
        nullable: true,
        description: "URL of the video for this sketch",
      },
      sketch_id: {
        type: "integer",
        nullable: true,
        description:
          "ID of the sketch if it was ultimately added to the database",
      },
    },
  },

  BatchLookupInput: {
    type: "object",
    description:
      "POST /lookup/batch — look up multiple search terms across multiple tables in one call. " +
      "Keys are table names, values are arrays of search terms. Returns results grouped by table and term. " +
      "Max 20 terms per table. Example: " +
      '{"person": ["Adam Driver", "Mikey Day"], "tag": ["Star Wars", "Kylo Ren"]}',
    additionalProperties: {
      type: "array",
      items: { type: "string" },
      description: "Search terms for this table",
    },
    example: {
      person: ["Adam Driver", "Mikey Day"],
      tag: ["Star Wars", "Undercover Boss"],
      show: ["Saturday Night Live"],
    },
  },

  LookupResult: {
    type: "object",
    description: "A lookup match returned by GET /lookup/{table}",
    properties: {
      id: { type: "integer" },
      label: { type: "string" },
    },
  },

  UploadImageDirectInput: {
    type: "object",
    description:
      "Direct image upload (recommended). POST multipart/form-data to /upload-image/direct " +
      "with 'file' and 'table_name' fields. The server uploads to S3 and creates the image " +
      "record in one step, returning the image_id. No need to compute file hashes or handle " +
      "presigned URLs. Use the returned image_id in sketch, cast, or person image updates.",
    required: ["file", "table_name"],
    properties: {
      file: {
        type: "string",
        format: "binary",
        description: "The image file (multipart/form-data file field)",
      },
      table_name: {
        type: "string",
        description:
          "Target table for organizing the upload (e.g. sketch, sketch_cast, person_image)",
      },
    },
  },

  PersonImageInput: {
    type: "object",
    description:
      "An image entry for a person. Upload the image first via POST /upload-image/direct to get the image_id.",
    required: ["image_id"],
    properties: {
      image_id: {
        type: "integer",
        description:
          "ID of the image (from /upload-image/finish). Upload the image first.",
      },
      description: {
        type: "string",
        nullable: true,
        description: "Optional description of the image",
      },
    },
  },

  SketchFullInput: {
    type: "object",
    description:
      "All-in-one sketch creation. Accepts names instead of IDs — the server resolves shows, " +
      "people, tags, and recurring sketches by name; finds or creates seasons and episodes; " +
      "downloads and uploads images from URLs; creates the sketch; revalidates caches; and " +
      "refreshes search. POST /api/sketches/full",
    required: ["title", "show"],
    properties: {
      title: { type: "string", description: "Sketch title" },
      show: {
        type: "string",
        description:
          'Show name (resolved by lookup). Example: "Saturday Night Live"',
      },
      season_number: {
        type: "integer",
        description:
          "Season number. Will find existing or create new (requires season_year to create).",
      },
      season_year: {
        type: "integer",
        description:
          "Year the season aired. Required only when creating a new season.",
      },
      episode_number: {
        type: "integer",
        description:
          "Episode number (requires season_number). Will find existing or create new.",
      },
      episode_air_date: {
        type: "string",
        format: "date",
        description: "Air date (YYYY-MM-DD). Used when creating a new episode.",
      },
      recurring_sketch: {
        type: "string",
        description:
          'Recurring sketch name (resolved by lookup). Example: "Star Wars Undercover Boss"',
      },
      video_urls: {
        type: "array",
        items: { type: "string" },
        description: "Video URLs",
      },
      teaser: { type: "string", description: "Short teaser text" },
      synopsis: { type: "string", description: "Full synopsis" },
      notes: { type: "string", description: "Additional notes" },
      link_urls: {
        type: "array",
        items: { type: "string" },
        description: "Related external links",
      },
      image_id: {
        type: "integer",
        description:
          "ID of the preview image. Upload via POST /upload-image/direct first.",
      },
      cast: {
        type: "array",
        description: "Cast members, using actor names instead of IDs.",
        items: { $ref: "SketchFullCastInput" },
      },
      credits: {
        type: "array",
        description: "Credits, using person names instead of IDs.",
        items: { $ref: "SketchFullCreditInput" },
      },
      quotes: {
        type: "array",
        items: { type: "string" },
        description: "Memorable quotes (plain strings)",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description:
          'Tag names (resolved by lookup). Example: ["Star Wars", "Undercover Boss"]',
      },
    },
  },

  SketchFullCastInput: {
    type: "object",
    description:
      'A cast member using actor name instead of ID. Example: {"person": "Adam Driver", "character_name": "Kylo Ren", "role": "Host"}',
    required: ["person", "role"],
    properties: {
      person: {
        type: "string",
        description: 'Actor name (resolved by lookup). Example: "Adam Driver"',
      },
      character_name: {
        type: "string",
        description: 'Name of the character played. Example: "Kylo Ren"',
      },
      role: {
        type: "string",
        enum: ["Cast", "Guest", "Host", "Uncredited"],
        description:
          "Actor's role type in the production — NOT the character name.",
      },
      minor_role: { type: "boolean", description: "Minor/non-speaking role" },
      image_id: {
        type: "integer",
        description:
          "Headshot image ID. Upload via POST /upload-image/direct first.",
      },
    },
  },

  SketchFullCreditInput: {
    type: "object",
    description: "A credit entry using person name instead of ID.",
    required: ["person", "role"],
    properties: {
      person: {
        type: "string",
        description: "Person name (resolved by lookup)",
      },
      role: {
        type: "string",
        enum: ["Writer", "Director", "Musician", "Other"],
        description: "Credit role",
      },
      description: {
        type: "string",
        nullable: true,
        description: "Additional description",
      },
    },
  },

  BatchRevalidateInput: {
    type: "object",
    description:
      "Revalidate multiple entities and optionally refresh search in one call. " +
      "POST /api/revalidate",
    properties: {
      entities: {
        type: "array",
        description:
          "Entities to revalidate. Tables use plural names: shows, seasons, episodes, sketches, recurring-sketches, people, characters, categories, tags",
        items: {
          type: "object",
          required: ["table", "id"],
          properties: {
            table: {
              type: "string",
              description: "Plural table name (e.g. sketches, people)",
            },
            id: { type: "integer", description: "Entity ID" },
          },
        },
      },
      refresh_search: {
        type: "boolean",
        description:
          "If true, also refresh the full-text search index (default: false)",
      },
    },
  },
};
