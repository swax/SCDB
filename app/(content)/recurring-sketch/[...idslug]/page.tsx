import { ContentPageProps, redirectByIdToSlugUrl } from "../../../contentBase";

export default async function RecurringSketchRedirect({
  params,
}: ContentPageProps) {
  return redirectByIdToSlugUrl("recurring-sketch", params);
}
