import { ContentPageProps, redirectByIdToSlugUrl } from "../../../contentBase";

export default async function SeasonRedirect({ params }: ContentPageProps) {
  return redirectByIdToSlugUrl("season", params);
}
