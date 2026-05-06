import {
  schemaRegistry,
  resolveSchemaRefs,
} from "@/backend/api/schemaRegistry";
import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import { revalidateEntityById } from "@/backend/api/entityApiService";
import { API_PREFIX } from "@/backend/api/hateoasHelpers";
import {
  buildTableCmsFromInput,
  setReviewStatusForApiContent,
  InputValidationError,
} from "@/backend/api/sketchApiService";
import {
  resolveFullInput,
  buildResolvedResponse,
} from "@/backend/api/sketchFullService";
import { SketchFullInputSchema } from "@/shared/schemas/sketchFull";
import { syncSketchToChecklist } from "@/backend/content/checklistSync";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import prisma from "@/database/prisma";
import { NextRequest, NextResponse } from "next/server";

export function GET() {
  const schema = resolveSchemaRefs(schemaRegistry["SketchFullInput"]);

  return NextResponse.json({
    description:
      "All-in-one sketch creation and update. Accepts names instead of IDs — " +
      "the server resolves everything, creates missing seasons/episodes, " +
      "and revalidates caches. Upload images separately via POST /upload-image/direct " +
      "and pass the returned image_id.",
    _actions: [
      {
        rel: "create",
        href: `${API_PREFIX}/sketches/full`,
        method: "POST",
        title: "Create a sketch (all-in-one)",
        schema: `${API_PREFIX}/schemas/SketchFullInput`,
      },
      {
        rel: "update",
        href: `${API_PREFIX}/sketches/full/{id}`,
        method: "PUT",
        title:
          "Update a sketch (all-in-one) — only provided fields are changed",
        schema: `${API_PREFIX}/schemas/SketchFullUpdateInput`,
      },
    ],
    schema,
    example: {
      title: "Undercover Boss: Where Are They Now",
      show: "Saturday Night Live",
      season_number: 45,
      season_year: 2019,
      episode_number: 11,
      episode_air_date: "2020-01-25",
      recurring_sketch: "Star Wars Undercover Boss",
      video_urls: ["https://www.youtube.com/watch?v=Brbrdnh74yA"],
      teaser: "Short description of the sketch",
      synopsis: "Full description of the sketch",
      notes: "Additional context or trivia",
      image_id: 3920,
      cast: [
        {
          person: "Adam Driver",
          character_name: "Kylo Ren / Randy the Intern",
          role: "Host",
          image_id: 3921,
        },
        {
          person: "Mikey Day",
          character_name: "Stormtrooper",
          role: "Cast",
        },
      ],
      quotes: ["okay boomer", "Another memorable line"],
      tags: ["Star Wars", "Undercover Boss", "Parody", 1726],
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateApiRequest(request);
    const input = SketchFullInputSchema.parse(await request.json());

    const resolved = await resolveFullInput(user, input);
    const table = await buildTableCmsFromInput(resolved.sketchInput, false);
    setReviewStatusForApiContent(table);

    // When no thumbnail provided, mark image_id as optional so validation passes
    if (!resolved.thumbnailImageId) {
      const imageField = table.fields.find((f) => f.column === "image_id");
      if (imageField) imageField.optional = true;
    }

    const result = await writeFieldValues(user, table, 0);
    if (result.error) {
      throw new InputValidationError(result.error);
    }

    const sketchId = result.content!.rowId;
    const urlSlug = result.content!.newSlug;

    await syncSketchToChecklist(sketchId, user.id);

    // Revalidate
    const revalidated = await revalidateSketchAndPeople(
      sketchId,
      resolved.castItems,
      resolved.creditItems,
    );

    return NextResponse.json(
      {
        id: sketchId,
        url_slug: urlSlug,
        resolved: buildResolvedResponse(resolved),
        revalidated,
        search_refreshed: true,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/** Revalidate the sketch and all associated people, plus refresh search */
export async function revalidateSketchAndPeople(
  sketchId: number,
  castItems: { person_id?: number | null }[],
  creditItems: { person_id?: number | null }[],
): Promise<string[]> {
  const revalidated: string[] = [];

  try {
    await revalidateEntityById("sketch", sketchId);
    revalidated.push(`sketches/${sketchId}`);
  } catch {
    // non-fatal
  }

  const personIds = new Set<number>();
  for (const c of castItems) {
    if (c.person_id) personIds.add(c.person_id);
  }
  for (const c of creditItems) {
    if (c.person_id) personIds.add(c.person_id);
  }
  for (const pid of personIds) {
    try {
      await revalidateEntityById("person", pid);
      revalidated.push(`people/${pid}`);
    } catch {
      // non-fatal
    }
  }

  await prisma.$executeRaw`SELECT refresh_sketch_search()`;

  return revalidated;
}
