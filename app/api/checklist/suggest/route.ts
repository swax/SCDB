import { handleApiError } from "@/backend/api/apiAuth";
import prisma from "@/database/prisma";
import { SHOW_COVERAGE } from "@/shared/showCoverage";
import { NextRequest, NextResponse } from "next/server";

const SPARSE_THRESHOLD = 5;

type Candidate = {
  show_id: number;
  show_title: string;
  season_number: number;
};

export async function GET(_request: NextRequest) {
  try {
    const showIds = SHOW_COVERAGE.map((s) => s.showId);

    const [shows, counts] = await Promise.all([
      prisma.show.findMany({
        where: { id: { in: showIds } },
        select: { id: true, title: true },
      }),
      prisma.checklist.groupBy({
        by: ["show_id", "season_number"],
        where: { show_id: { in: showIds } },
        _count: { _all: true },
      }),
    ]);

    const showTitleById = new Map(shows.map((s) => [s.id, s.title]));
    const countByKey = new Map<string, number>(
      counts.map((r) => [`${r.show_id}:${r.season_number}`, r._count._all]),
    );

    const candidates: Candidate[] = [];
    for (const { showId, totalSeasons } of SHOW_COVERAGE) {
      const showTitle = showTitleById.get(showId);
      if (!showTitle) continue;
      for (let n = 1; n <= totalSeasons; n++) {
        const count = countByKey.get(`${showId}:${n}`) ?? 0;
        if (count > SPARSE_THRESHOLD) continue;
        candidates.push({
          show_id: showId,
          show_title: showTitle,
          season_number: n,
        });
      }
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: "No sparse seasons found across the targeted shows" },
        { status: 404 },
      );
    }

    const pick = candidates[Math.floor(Math.random() * candidates.length)];

    return NextResponse.json(pick);
  } catch (error) {
    return handleApiError(error);
  }
}
