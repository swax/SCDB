/** Stable source identity, deliberately independent of titles and search text. */
export function sourceVideoKey(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;
  if (host === "youtu.be") id = parts.length === 1 ? parts[0] : null;
  else if (
    [
      "youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "youtube-nocookie.com",
    ].includes(host)
  ) {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (
      ["shorts", "embed", "live"].includes(parts[0]) &&
      parts.length === 2
    )
      id = parts[1];
  }
  if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) return `youtube:${id}`;
  if (host === "vimeo.com" && parts.length === 1 && /^\d+$/.test(parts[0]))
    return `vimeo:${parts[0]}`;
  if (
    host === "player.vimeo.com" &&
    parts[0] === "video" &&
    /^\d+$/.test(parts[1] ?? "")
  )
    return `vimeo:${parts[1]}`;
  return null;
}

export function matchingSourceKeys(
  urls: string[],
  wanted: Set<string>,
): string[] {
  return [
    ...new Set(
      urls
        .map(sourceVideoKey)
        .filter((key): key is string => !!key && wanted.has(key)),
    ),
  ];
}
