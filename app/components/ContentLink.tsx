import Link from "next/link";
import MuiNextLink from "./MuiNextLink";

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
    title?: string;
    year?: number;
  };
  children?: React.ReactNode;
}) {
  const href = `/${table}/${entry.id}/${entry.url_slug}`;
  const content = children || entry.name || entry.title || entry.year;

  return mui ? (
    <MuiNextLink href={href}>{content}</MuiNextLink>
  ) : (
    <Link href={href}>{content}</Link>
  );
}
