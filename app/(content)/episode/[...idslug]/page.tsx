import { ContentPageProps, redirectByIdToSlugUrl } from "../../../contentBase";

export default async function EpisodeRedirect({ params }: ContentPageProps) {
  return redirectByIdToSlugUrl("episode", params);
}
