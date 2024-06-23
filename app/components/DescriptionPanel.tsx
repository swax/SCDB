import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotesIcon from "@mui/icons-material/Notes";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { useId } from "react";
import Markdown from "react-markdown";

export default function DescriptionPanel({
  description,
  title,
}: {
  description?: Nullable<string>;
  title?: string;
}) {
  // Hooks
  const id = useId();

  // Rendering
  return (
    <>
      {!!description && (
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`description-content-${id}`}
            id={`description-header-${id}`}
          >
            <NotesIcon />
            <Typography
              fontWeight="bold"
              marginLeft={1}
              component="h2"
              variant="body1"
            >
              {title || "Description"}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Markdown>{description}</Markdown>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}
