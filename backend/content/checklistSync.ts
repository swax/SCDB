import prisma from "@/database/prisma";
import { checklist_status_type } from "@/shared/enums";

/**
 * Ensure a checklist row exists for the given sketch with status=Added.
 * Idempotent — call after creating or updating a sketch. If a checklist row
 * already references this sketch, update it; otherwise create one.
 */
export async function syncSketchToChecklist(
  sketchId: number,
  userId: string,
): Promise<"created" | "updated" | "noop"> {
  const sketch = await prisma.sketch.findUnique({
    where: { id: sketchId },
    select: {
      id: true,
      show_id: true,
      title: true,
      season: { select: { number: true } },
      episode: { select: { number: true } },
    },
  });
  if (!sketch) return "noop";

  const data = {
    show_id: sketch.show_id,
    season_number: sketch.season?.number ?? -1,
    episode_number: sketch.episode?.number ?? null,
    sketch_title: sketch.title,
    status: checklist_status_type.Added,
  };

  const existing = await prisma.checklist.findFirst({
    where: { sketch_id: sketchId },
    select: { id: true },
  });

  if (existing) {
    await prisma.checklist.update({
      where: { id: existing.id },
      data: { ...data, modified_by_id: userId, modified_at: new Date() },
    });
    return "updated";
  }

  await prisma.checklist.create({
    data: {
      ...data,
      sketch_id: sketchId,
      created_by_id: userId,
      modified_by_id: userId,
    },
  });
  return "created";
}

/**
 * Find all sketches that don't have a corresponding checklist row and create
 * one each (status=Added, linked via sketch_id). Also refresh existing rows
 * whose linked sketch's title/season/episode have drifted.
 */
export async function backsyncAllSketches(userId: string): Promise<{
  inserted: number;
  updated: number;
  total_sketches: number;
}> {
  const sketches = await prisma.sketch.findMany({
    select: {
      id: true,
      show_id: true,
      title: true,
      season: { select: { number: true } },
      episode: { select: { number: true } },
    },
  });

  const existingRows = await prisma.checklist.findMany({
    where: { sketch_id: { not: null } },
    select: {
      id: true,
      sketch_id: true,
      show_id: true,
      season_number: true,
      episode_number: true,
      sketch_title: true,
      status: true,
    },
  });
  const existingBySketchId = new Map(
    existingRows.map((r) => [r.sketch_id as number, r]),
  );

  const toInsert: {
    show_id: number;
    season_number: number;
    episode_number: number | null;
    sketch_title: string;
    sketch_id: number;
    status: checklist_status_type;
    created_by_id: string;
    modified_by_id: string;
  }[] = [];
  const toUpdate: {
    id: number;
    show_id: number;
    season_number: number;
    episode_number: number | null;
    sketch_title: string;
  }[] = [];

  for (const s of sketches) {
    const target = {
      show_id: s.show_id,
      season_number: s.season?.number ?? -1,
      episode_number: s.episode?.number ?? null,
      sketch_title: s.title,
    };
    const existing = existingBySketchId.get(s.id);
    if (!existing) {
      toInsert.push({
        ...target,
        sketch_id: s.id,
        status: checklist_status_type.Added,
        created_by_id: userId,
        modified_by_id: userId,
      });
      continue;
    }
    if (
      existing.show_id !== target.show_id ||
      existing.season_number !== target.season_number ||
      existing.episode_number !== target.episode_number ||
      existing.sketch_title !== target.sketch_title
    ) {
      toUpdate.push({ id: existing.id, ...target });
    }
  }

  if (toInsert.length > 0) {
    await prisma.checklist.createMany({ data: toInsert });
  }
  for (const u of toUpdate) {
    await prisma.checklist.update({
      where: { id: u.id },
      data: {
        show_id: u.show_id,
        season_number: u.season_number,
        episode_number: u.episode_number,
        sketch_title: u.sketch_title,
        modified_by_id: userId,
        modified_at: new Date(),
      },
    });
  }

  return {
    inserted: toInsert.length,
    updated: toUpdate.length,
    total_sketches: sketches.length,
  };
}
