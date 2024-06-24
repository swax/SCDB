import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotesIcon from "@mui/icons-material/Notes";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { useId } from "react";
import Markdown from "react-markdown";
import AccordionHeader from "./AccordionHeader";

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
            <AccordionHeader icon={<NotesIcon />}>
              {title || "Description"}
            </AccordionHeader>
          </AccordionSummary>
          <AccordionDetails>
            <Markdown>{description}</Markdown>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}
