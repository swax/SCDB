import ChangeLogTable from "@/app/changelog/components/ChangeLogTable";
import AccordionHeader from "@/app/components/AccordionHeader";
import MuiNextLink from "@/app/components/MuiNextLink";
import { GetChangelogResponse } from "@/backend/mgmt/changelogService";
import DifferenceIcon from "@mui/icons-material/Difference";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getChangeLogAction } from "./actions/getActions";

export default function ChangeLog({ username }: { username: string }) {
  // Constants
  const page = 1;
  const rowsPerPage = 5;

  // Hooks
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changelog, setChangelog] = useState<GetChangelogResponse>();

  useEffect(() => {
    if (expanded && !loading && !changelog) {
      setLoading(true);
      void getChangeLogAction(username, page, rowsPerPage).then(
        (changeLogResponse) => {
          setChangelog(changeLogResponse);
          setLoading(false);
        },
      );
    }
  }, [expanded]);

  // Rendering
  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="edits-content"
        id="edits-header"
      >
        <AccordionHeader icon={<DifferenceIcon />}>
          Latest Edits
        </AccordionHeader>
      </AccordionSummary>
      <AccordionDetails>
        {loading ? (
          <Box>Loading...</Box>
        ) : changelog ? (
          <>
            <Box style={{ overflowX: "auto" }}>
              <ChangeLogTable
                changelog={changelog}
                page={page}
                rowsPerPage={rowsPerPage}
                profilePage={true}
              />
            </Box>
            <Box style={{ marginTop: 16 }}>
              <MuiNextLink
                href={`/changelog?username=${username}`}
                prefetch={false}
              >
                See full change history
              </MuiNextLink>
            </Box>
          </>
        ) : (
          <Box>No edits</Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
