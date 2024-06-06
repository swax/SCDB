"use client";

import SketchGrid from "@/app/(content)/SketchGrid";
import ChangeLogTable from "@/app/changelog/components/ChangeLogTable";
import MuiNextLink from "@/app/components/MuiNextLink";
import { GetChangelogResponse } from "@/backend/mgmt/changelogService";
import { GetProfileResponse } from "@/backend/user/profileService";
import { SketchGridData } from "@/shared/sketchGridBase";
import DifferenceIcon from "@mui/icons-material/Difference";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import { user_role_type } from "@prisma/client";
import ModPanel from "./ModPanel";
import { allowedToChangeRole } from "@/shared/roleUtils";

interface ProfileClientPageProps {
  profile: GetProfileResponse;
  sessionUsername?: string;
  sessionRole?: user_role_type;
  changelog: GetChangelogResponse;
  page: number;
  rowsPerPage: number;
  initialSketchData: SketchGridData;
  getSketchData: (page: number) => Promise<SketchGridData>;
}

export default function ProfileClientPage({
  profile,
  sessionRole,
  sessionUsername,
  changelog,
  page,
  rowsPerPage,
  initialSketchData,
  getSketchData,
}: ProfileClientPageProps) {
  // Constants
  const showModOptions =
    sessionRole &&
    sessionUsername &&
    sessionUsername !== profile.username &&
    allowedToChangeRole(profile.role, sessionRole);

  // Rendering
  const pageTitle = profile.username + " - SketchTV.lol";

  return (
    <Box>
      <title>{pageTitle}</title>
      <Box mb={4}>
        <Typography variant="h4">{profile.username}</Typography>
        <Typography variant="subtitle1">Role: {profile.role}</Typography>
      </Box>

      <SketchGrid
        initialData={initialSketchData}
        getData={getSketchData}
        title="Rated Sketches"
      />

      {showModOptions && <ModPanel profile={profile} />}

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="sketches-content"
          id="sketches-header"
        >
          <DifferenceIcon />
          <Typography fontWeight="bold" marginLeft={1}>
            Latest Edits
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ChangeLogTable
            changelog={changelog}
            page={page}
            rowsPerPage={rowsPerPage}
            profilePage={true}
          />
          <Box mt={2}>
            <MuiNextLink href={`/changelog?username=${profile.username}`}>
              See full change history
            </MuiNextLink>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
