import Link from "next/link";

export function ContentLink({
  table,
  entry,
}: {
  table: string;
  entry: {
    id: number;
    url_slug: string;
    name?: string;
    title?: string;
    year?: number;
  };
}) {
  return (
    <Link
      href={`/${table}/${entry.id}/${entry.url_slug}`}
    >
      {entry.name || entry.title || entry.year}
    </Link>
  );
}
