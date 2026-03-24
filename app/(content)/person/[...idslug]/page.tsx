import { ContentPageProps, redirectByIdToSlugUrl } from "../../../contentBase";

export default async function PersonRedirect({ params }: ContentPageProps) {
  return redirectByIdToSlugUrl("person", params);
}
