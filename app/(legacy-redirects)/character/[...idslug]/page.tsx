import { ContentPageProps, redirectByIdToSlugUrl } from "../../../contentBase";

export default async function CharacterRedirect({ params }: ContentPageProps) {
  return redirectByIdToSlugUrl("character", params);
}
