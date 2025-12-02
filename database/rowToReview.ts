import { review_status_type } from "@/shared/enums";

/** Returned by the select_rows_to_review() function */
export interface RowToReview {
  table_name: string;
  row_id: number;
  review_status: review_status_type;
  modified_by_username: string;
  modified_at: Date;
}
