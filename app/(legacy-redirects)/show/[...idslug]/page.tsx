import { ContentPageProps, redirectByIdToSlugUrl } from "../../../contentBase";

export default async function ShowRedirect({ params }: ContentPageProps) {
  return redirectByIdToSlugUrl("show", params);
}
