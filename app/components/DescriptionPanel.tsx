import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotesIcon from "@mui/icons-material/Notes";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { useId } from "react";
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
            <Typography
              component="div"
              variant="body1"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {description}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}
