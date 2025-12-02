import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkIcon from "@mui/icons-material/Link";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Stack,
} from "@mui/material";
import { useMemo } from "react";
import AccordionHeader from "./AccordionHeader";

export default function LinksPanel({
  link_urls,
}: {
  link_urls?: Nullable<string[]>;
}) {
  // Helpers
  function getDomainName(link: string) {
    const url = new URL(link);
    return url.hostname;
  }

  // Hooks
  const domainAndUrls = useMemo(
    () => link_urls?.map((link) => [getDomainName(link), link] as const) || [],
    [link_urls],
  );

  // Rendering
  return (
    <>
      {!!link_urls && !!link_urls.length && (
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="links-content"
            id="links-header"
          >
            <AccordionHeader icon={<LinkIcon />}>Links</AccordionHeader>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction={"row"} gap={1}>
              {domainAndUrls.map(([domain, url], index) => (
                <Chip
                  clickable
                  component={"a"}
                  href={url}
                  key={index}
                  label={domain}
                  rel="noreferrer"
                  target="_blank"
                  title={url}
                  variant="outlined"
                />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}
