"use client";

import SketchGrid from "@/app/(content)/SketchGrid";
import ChangeLogTable from "@/app/changelog/components/ChangeLogTable";
import MuiNextLink from "@/app/components/MuiNextLink";
import { GetChangelogResponse } from "@/backend/mgmt/changelogService";
import { GetProfileResponse } from "@/backend/user/profileService";
import { allowedToChangeRole } from "@/shared/roleUtils";
import { ServiceResponse } from "@/shared/serviceResponse";
import { SketchGridData } from "@/shared/sketchGridBase";
import DifferenceIcon from "@mui/icons-material/Difference";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { user_role_type } from "@prisma/client";
import { useState } from "react";
import { saveModNote, saveRole } from "./actions/saveActions";

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

  // Hooks
  const [editRole, setEditRole] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRole, setNewRole] = useState(profile.role);
  const [modNote, setModNote] = useState(profile.mod_note || "");

  // Event Handlers
  async function saveRoleButton_click() {
    await saveChanges(() => saveRole(profile.id, newRole));
  }

  async function setModNote_click() {
    await saveChanges(() => saveModNote(profile.id, modNote));
  }

  // Helpers
  async function saveChanges<T>(
    serverAction: () => Promise<ServiceResponse<T>>,
  ) {
    setSaving(true);

    const response = await serverAction();

    if (response.error) {
      alert(response.error);
      setSaving(false);
    } else {
      window.location.reload();
    }
  }

  // Rendering
  const pageTitle = profile.username + " - SketchTV.lol";

  return (
    <Box>
      <title>{pageTitle}</title>
      <Box mb={4}>
        <Typography variant="h4">{profile.username}</Typography>
        <Typography variant="subtitle1">Role: {profile.role}</Typography>
      </Box>

      <Box mt={2}>
        {editRole ? (
          <>
            <Box>
              <Select
                disabled={saving}
                onChange={(e) => setNewRole(e.target.value as user_role_type)}
                size="small"
                value={newRole}
              >
                <MenuItem value={user_role_type.None}>None</MenuItem>
                <MenuItem value={user_role_type.Editor}>Editor</MenuItem>
                <MenuItem value={user_role_type.Moderator}>Moderator</MenuItem>
                <MenuItem value={user_role_type.SuperMod}>SuperMod</MenuItem>
                <MenuItem value={user_role_type.Admin}>Admin</MenuItem>
              </Select>
              <Button
                color="primary"
                disabled={saving}
                onClick={() => void saveRoleButton_click()}
                sx={{ ml: 2 }}
                variant="outlined"
              >
                Save
              </Button>
              <Button
                color="inherit"
                onClick={() => setEditRole(false)}
                sx={{ ml: 1 }}
                variant="outlined"
              >
                Cancel
              </Button>
            </Box>
          </>
        ) : (
          <>
            {showModOptions && (
              <Button
                sx={{ display: "inline", ml: 2 }}
                variant="outlined"
                size="small"
                onClick={() => setEditRole(true)}
              >
                Change
              </Button>
            )}
          </>
        )}
      </Box>

      {showModOptions && (
        <Box sx={{ display: "flex", mt: 2 }}>
          <TextField
            disabled={saving}
            label="Mod Note"
            multiline
            onChange={(e) => setModNote(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            value={modNote}
          />
          <Button
            disabled={saving}
            onClick={() => void setModNote_click()}
            size="small"
            sx={{ ml: 1 }}
            variant="outlined"
          >
            Set
          </Button>
        </Box>
      )}

      <SketchGrid
        initialData={initialSketchData}
        getData={getSketchData}
        title="Rated Sketches"
      />
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
