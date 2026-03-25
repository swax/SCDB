import { NextResponse } from "next/server";

const API_PREFIX = "/api";
const SCHEMAS = `${API_PREFIX}/schemas`;

export function GET() {
  return NextResponse.json({
    _links: [
      { rel: "self", href: `${API_PREFIX}/`, title: "API Discovery" },
      {
        rel: "schemas",
        href: `${SCHEMAS}/`,
        title: "Schema Registry",
      },
      {
        rel: "shows",
        href: `${API_PREFIX}/shows`,
        title: "List/Create Shows",
        methods: ["GET", "POST"],
        schema: `${SCHEMAS}/ShowInput`,
      },
      {
        rel: "show",
        href: `${API_PREFIX}/shows/{id}`,
        title: "Get/Update/Delete Show",
        methods: ["GET", "PUT", "DELETE"],
        schema: `${SCHEMAS}/ShowInput`,
      },
      {
        rel: "seasons",
        href: `${API_PREFIX}/seasons`,
        title: "List/Create Seasons",
        methods: ["GET", "POST"],
        schema: `${SCHEMAS}/SeasonInput`,
      },
      {
        rel: "season",
        href: `${API_PREFIX}/seasons/{id}`,
        title: "Get/Update/Delete Season",
        methods: ["GET", "PUT", "DELETE"],
        schema: `${SCHEMAS}/SeasonInput`,
      },
      {
        rel: "episodes",
        href: `${API_PREFIX}/episodes`,
        title: "List/Create Episodes",
        methods: ["GET", "POST"],
        schema: `${SCHEMAS}/EpisodeInput`,
      },
      {
        rel: "episode",
        href: `${API_PREFIX}/episodes/{id}`,
        title: "Get/Update/Delete Episode",
        methods: ["GET", "PUT", "DELETE"],
        schema: `${SCHEMAS}/EpisodeInput`,
      },
      {
        rel: "sketches",
        href: `${API_PREFIX}/sketches`,
        title: "List/Create Sketches",
        methods: ["GET", "POST"],
        schema: `${SCHEMAS}/SketchInput`,
      },
      {
        rel: "sketch",
        href: `${API_PREFIX}/sketches/{id}`,
        title: "Get/Update/Delete Sketch",
        methods: ["GET", "PUT", "DELETE"],
        schema: `${SCHEMAS}/SketchUpdateInput`,
      },
      {
        rel: "recurring-sketches",
        href: `${API_PREFIX}/recurring-sketches`,
        title: "List/Create Recurring Sketches",
        methods: ["GET", "POST"],
        schema: `${SCHEMAS}/RecurringSketchInput`,
      },
      {
        rel: "recurring-sketch",
        href: `${API_PREFIX}/recurring-sketches/{id}`,
        title: "Get/Update/Delete Recurring Sketch",
        methods: ["GET", "PUT", "DELETE"],
        schema: `${SCHEMAS}/RecurringSketchInput`,
      },
      {
        rel: "people",
        href: `${API_PREFIX}/people`,
        title: "List/Create People",
        methods: ["GET", "POST"],
        schema: `${SCHEMAS}/PersonInput`,
      },
      {
        rel: "person",
        href: `${API_PREFIX}/people/{id}`,
        title: "Get/Update/Delete Person",
        methods: ["GET", "PUT", "DELETE"],
        schema: `${SCHEMAS}/PersonUpdateInput`,
      },
      {
        rel: "characters",
        href: `${API_PREFIX}/characters`,
        title: "List/Create Characters",
        methods: ["GET", "POST"],
        schema: `${SCHEMAS}/CharacterInput`,
      },
      {
        rel: "character",
        href: `${API_PREFIX}/characters/{id}`,
        title: "Get/Update/Delete Character",
        methods: ["GET", "PUT", "DELETE"],
        schema: `${SCHEMAS}/CharacterInput`,
      },
      {
        rel: "categories",
        href: `${API_PREFIX}/categories`,
        title: "List/Create Categories",
        methods: ["GET", "POST"],
        schema: `${SCHEMAS}/CategoryInput`,
      },
      {
        rel: "category",
        href: `${API_PREFIX}/categories/{id}`,
        title: "Get/Update/Delete Category",
        methods: ["GET", "PUT", "DELETE"],
        schema: `${SCHEMAS}/CategoryInput`,
      },
      {
        rel: "tags",
        href: `${API_PREFIX}/tags`,
        title: "List/Create Tags",
        methods: ["GET", "POST"],
        schema: `${SCHEMAS}/TagInput`,
      },
      {
        rel: "tag",
        href: `${API_PREFIX}/tags/{id}`,
        title: "Get/Update/Delete Tag",
        methods: ["GET", "PUT", "DELETE"],
        schema: `${SCHEMAS}/TagInput`,
      },
      {
        rel: "checklist",
        href: `${API_PREFIX}/checklist`,
        title: "List/Create Checklist Items",
        methods: ["GET", "POST"],
        schema: `${SCHEMAS}/ChecklistInput`,
      },
      {
        rel: "checklist-item",
        href: `${API_PREFIX}/checklist/{id}`,
        title: "Get/Update/Delete Checklist Item",
        methods: ["GET", "PUT", "DELETE"],
        schema: `${SCHEMAS}/ChecklistInput`,
      },
      {
        rel: "lookup",
        href: `${API_PREFIX}/lookup/{table}?search={term}`,
        title:
          "Lookup entity IDs by name (tables: show, season, episode, person, character, tag, recurring_sketch, category)",
        methods: ["GET"],
      },
      {
        rel: "upload-image-begin",
        href: `${API_PREFIX}/upload-image/begin`,
        title: "Image upload step 1: Get presigned S3 URL",
        methods: ["POST"],
        schema: `${SCHEMAS}/UploadImageBeginInput`,
      },
      {
        rel: "upload-image-finish",
        href: `${API_PREFIX}/upload-image/finish`,
        title: "Image upload step 3: Register uploaded image, returns image_id",
        methods: ["POST"],
        schema: `${SCHEMAS}/UploadImageFinishInput`,
      },
    ],
    _uploadWorkflow: {
      description:
        "To upload an image and attach it to a resource, follow these 3 steps:",
      steps: [
        {
          step: 1,
          action: "POST /api/upload-image/begin",
          description:
            "Send file metadata (table_name, file_name, mime_type, file_size, file_hash). Returns a presigned S3 POST URL and fields.",
          schema: `${SCHEMAS}/UploadImageBeginInput`,
        },
        {
          step: 2,
          action: "POST to presigned_post.url",
          description:
            "Upload the file directly to S3 using multipart/form-data. Include all fields from presigned_post.fields, plus the file as the last field named 'file'.",
        },
        {
          step: 3,
          action: "POST /api/upload-image/finish",
          description:
            "Send the aws_key from step 1 as cdn_key. Returns image_id.",
          schema: `${SCHEMAS}/UploadImageFinishInput`,
        },
      ],
      usage: {
        sketch_preview_image:
          "PUT /api/sketches/{id} with image_id in the body",
        cast_thumbnail:
          "PUT /api/sketches/{id} with cast array containing image_id on each cast entry",
        person_images:
          "PUT /api/people/{id} with images array containing {image_id, description} entries",
      },
    },
  });
}
