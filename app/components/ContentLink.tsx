import Link from "next/link";
import { ReactNode } from "react";
import MuiNextLink from "./MuiNextLink";

/** Minimal link used for returning with data from server action */
export function ContentLink({
  mui,
  table,
  entry,
  children,
}: {
  /** Not set when sending links from the backend */
  mui?: boolean;
  table: string;
  /** If not set then the content will not be wrapped in a link */
  entry:
    | {
        id: number;
        url_slug: string;
        name?: string;
        title?: string | ReactNode;
        year?: number;
      }
    | undefined
    | null;
  children?: React.ReactNode;
}) {
  if (!entry) {
    return <>{children}</>;
  }

  const href = `/${table}/${entry.id}/${entry.url_slug}`;
  const content = children || entry.name || entry.title || entry.year;

  return mui ? (
    <MuiNextLink href={href} underline="hover">
      {content}
    </MuiNextLink>
  ) : (
    <Link href={href}>{content}</Link>
  );
}
