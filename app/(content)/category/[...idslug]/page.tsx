import { ContentPageProps, redirectByIdToSlugUrl } from "../../../contentBase";

export default async function CategoryRedirect({ params }: ContentPageProps) {
  return redirectByIdToSlugUrl("category", params);
}
