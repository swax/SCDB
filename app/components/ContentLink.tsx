import Link from "next/link";
import MuiNextLink from "./MuiNextLink";
import { ReactNode } from "react";

/** Minimal link used for returning with data from server action */
export function ContentLink({
  mui,
  table,
  entry,
  children,
}: {
  mui?: boolean;
  table: string;
  entry: {
    id: number;
    url_slug: string;
    name?: string;
    title?: string | ReactNode;
    year?: number;
  };
  children?: React.ReactNode;
}) {
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
