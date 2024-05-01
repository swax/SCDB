"use client";

import { GetChangelogResponse } from "@/backend/changelogService";
import { GetProfileResponse } from "@/backend/profileService";
import ChangeLogTable from "@/frontend/hooks/ChangeLogTable";
import { allowedToChangeRole } from "@/shared/roleUtils";
import { Box, Button, Link, MenuItem, Select, Typography } from "@mui/material";
import { $Enums } from "@prisma/client";
import { useState } from "react";
import { saveRole } from "./actions/saveRoleAction";

interface ProfileClientPageProps {
  profile: GetProfileResponse;
  sessionUsername?: string;
  sessionRole?: $Enums.user_role_type;
  changelog: GetChangelogResponse;
  page: number;
  rowsPerPage: number;
}

export default function ProfileClientPage({
  profile,
  sessionRole,
  sessionUsername,
  changelog,
  page,
  rowsPerPage,
}: ProfileClientPageProps) {
  // Constants
  const showEditRoleButton =
    sessionRole &&
    sessionUsername &&
    sessionUsername !== profile.username &&
    allowedToChangeRole(profile.role, sessionRole);

  // Hooks
  const [editRole, setEditRole] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRole, setNewRole] = useState(profile.role);

  // Event Handlers
  async function saveRoleButton_click() {
    setSaving(true);

    const response = await saveRole(profile.id, newRole);

    if (response.error) {
      alert(response.error);
      setSaving(false);
    } else {
      window.location.reload();
    }
  }

  // Rendering
  return (
    <Box>
      <h1>{profile.username}</h1>

      <Box mt={2}>
        {editRole ? (
          <>
            <Box>
              <Select
                disabled={saving}
                onChange={(e) =>
                  setNewRole(e.target.value as $Enums.user_role_type)
                }
                size="small"
                value={newRole}
              >
                <MenuItem value={$Enums.user_role_type.None}>None</MenuItem>
                <MenuItem value={$Enums.user_role_type.Editor}>Editor</MenuItem>
                <MenuItem value={$Enums.user_role_type.Moderator}>
                  Moderator
                </MenuItem>
                <MenuItem value={$Enums.user_role_type.SuperMod}>
                  SuperMod
                </MenuItem>
                <MenuItem value={$Enums.user_role_type.Admin}>Admin</MenuItem>
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
            <Typography variant="body1" sx={{ display: "inline" }}>
              Role: {profile.role}
            </Typography>
            {showEditRoleButton && (
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

      <h2>Favorite Sketches</h2>
      <p>....</p>

      <h2>Latest Edits</h2>
      <ChangeLogTable
        changelog={changelog}
        page={page}
        rowsPerPage={rowsPerPage}
        profilePage={true}
      />
      <Box mt={2}>
        <Link href={`/changelog?username=${profile.username}`}>
          See full change history
        </Link>
      </Box>
    </Box>
  );
}
