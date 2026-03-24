import { ContentPageProps, redirectByIdToSlugUrl } from "../../../contentBase";

export default async function SketchRedirect({ params }: ContentPageProps) {
  return redirectByIdToSlugUrl("sketch", params);
}
