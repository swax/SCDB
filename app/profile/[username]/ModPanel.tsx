import AccordionHeader from "@/app/components/AccordionHeader";
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
} from "@mui/material";
import type { user_role_type } from '@/database/generated/client';
import { user_role_type as UserRole } from '@/shared/enums';
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
        <AccordionHeader icon={<ShieldIcon />}>Moderation</AccordionHeader>
      </AccordionSummary>
      <AccordionDetails>
        {editRole ? (
          <>
            <Box>
              <Select
                disabled={saving}
                onChange={(e) => setNewRole(e.target.value)}
                size="small"
                value={newRole}
              >
                <MenuItem value={UserRole.None}>None</MenuItem>
                <MenuItem value={UserRole.Editor}>Editor</MenuItem>
                <MenuItem value={UserRole.Moderator}>Moderator</MenuItem>
                <MenuItem value={UserRole.SuperMod}>SuperMod</MenuItem>
                <MenuItem value={UserRole.Admin}>Admin</MenuItem>
              </Select>
              <Button
                color="primary"
                disabled={saving}
                onClick={() => void saveRoleButton_click()}
                style={{ marginLeft: 16 }}
                variant="outlined"
              >
                Save
              </Button>
              <Button
                color="inherit"
                onClick={() => setEditRole(false)}
                style={{ marginLeft: 8 }}
                variant="outlined"
              >
                Cancel
              </Button>
            </Box>
          </>
        ) : (
          <Button
            style={{ display: "inline", marginLeft: 16 }}
            variant="outlined"
            size="small"
            onClick={() => setEditRole(true)}
          >
            Change Role
          </Button>
        )}
        <Box style={{ display: "flex", marginTop: 16 }}>
          <TextField
            disabled={saving}
            label="Mod Note"
            multiline
            onChange={(e) => setModNote(e.target.value)}
            size="small"
            style={{ flex: 1 }}
            value={modNote}
          />
          <Button
            disabled={saving}
            onClick={() => void setModNote_click()}
            size="small"
            style={{ marginLeft: 8 }}
            variant="outlined"
          >
            Set
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
