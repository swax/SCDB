/** JSON Schema definitions for API request/response types, served individually on demand */
export const schemaRegistry: Record<string, object> = {
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
      posted_on_socials: {
        type: "boolean",
        description: "Whether this has been posted on social media",
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
        description: "Memorable quotes from the sketch. See QuoteInput schema.",
        items: { $ref: "QuoteInput" },
      },
      tags: {
        type: "array",
        description: "Tags for categorization. See TagInput schema.",
        items: { $ref: "SketchTagInput" },
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
        description: "Replaces all existing quote entries",
        items: { $ref: "QuoteInput" },
      },
      tags: {
        type: "array",
        description: "Replaces all existing tag entries",
        items: { $ref: "SketchTagInput" },
      },
    },
  },

  CastInput: {
    type: "object",
    description: "A cast member entry for a sketch",
    required: ["role"],
    properties: {
      character_name: {
        type: "string",
        nullable: true,
        description: "Name of the character played",
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
        description: "Role type",
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
    },
  },

  PersonUpdateInput: {
    type: "object",
    description:
      "Request body for updating a person (PUT /people/{id}). All fields optional. " +
      "Only provided fields are updated.",
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

  LookupResult: {
    type: "object",
    description: "A lookup match returned by GET /lookup/{table}",
    properties: {
      id: { type: "integer" },
      label: { type: "string" },
    },
  },
};
