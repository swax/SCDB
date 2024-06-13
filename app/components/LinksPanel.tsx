import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkIcon from "@mui/icons-material/Link";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import MuiNextLink from "./MuiNextLink";

export default function LinksPanel({
  link_urls,
}: {
  link_urls?: Nullable<string[]>;
}) {
  // Hooks
  const domainAndUrls = useMemo(
    () => link_urls?.map((link) => [getDomainName(link), link] as const) || [],
    [link_urls],
  );

  function getDomainName(link: string) {
    const url = new URL(link);
    return url.hostname;
  }

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
            <LinkIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              Links
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {domainAndUrls.map(([, url], index) => (
              <Box key={index}>
                <MuiNextLink href={url} target="_blank" rel="noreferrer">
                  {url}
                </MuiNextLink>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}
