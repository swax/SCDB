import { ContentPageProps, redirectByIdToSlugUrl } from "../../../contentBase";

export default async function TagRedirect({ params }: ContentPageProps) {
  return redirectByIdToSlugUrl("tag", params);
}
