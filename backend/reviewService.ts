import prisma from "@/database/prisma";
import { RowToReview } from "@/database/rowToReview";

export async function getRowsToReview(rowCount: number) {
  const rowsToReview: RowToReview[] =
    await prisma.$queryRaw`SELECT * FROM select_rows_to_review(${rowCount}::int )`;

  return rowsToReview;
}
