import { GetProfileResponse } from "@/backend/user/profileService";
import { ServiceResponse } from "@/shared/serviceResponse";
import { showAndLogError } from "@/shared/utilities";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShieldIcon from "@mui/icons-material/Shield";
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

interface ModPanelProps {
  profile: GetProfileResponse;
}

export default function ModPanel({ profile }: ModPanelProps) {
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
      showAndLogError(response.error);
      setSaving(false);
    } else {
      window.location.reload();
    }
  }

  // Rendering
  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="mod-content"
        id="mod-header"
      >
        <ShieldIcon />
        <Typography
          fontWeight="bold"
          marginLeft={1}
          component="h2"
          variant="body1"
        >
          Moderation
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
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
          <Button
            sx={{ display: "inline", ml: 2 }}
            variant="outlined"
            size="small"
            onClick={() => setEditRole(true)}
          >
            Change Role
          </Button>
        )}
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
      </AccordionDetails>
    </Accordion>
  );
}
