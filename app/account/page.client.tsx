"use client";

import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { $Enums } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import saveUsername from "./actions/saveAction";

interface AccountClientPageProps {
  id: string;
  email: string | null;
  username: string | null;
  role: $Enums.user_role_type;
}

export default function AccountClientPage(account: AccountClientPageProps) {
  // State
  const [editUsername, setEditUsername] = useState(false);
  const [username, setUsername] = useState(account.username);
  const [saving, setSaving] = useState(false);
  const session = useSession();

  // Events
  async function saveUsernameButton_click() {
    if (!username) {
      return;
    }

    setSaving(true);

    await saveUsername(username);

    // Triggers authOptions.ts jwt callback which updates the jwt/session with the new username
    await session.update();

    // reload page with next js
    window.location.reload();
  }

  // Rendering
  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h4" align="center">
          My Account
        </Typography>
        <Typography variant="body1" mt={4}>
          Email: {account.email}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Note: Your account is linked to your Google account.
        </Typography>
        <Box mt={4}>
          {editUsername || !username ? (
            <>
              <Box>
                <TextField
                  disabled={saving}
                  label="Username"
                  margin="normal"
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ width: "50%" }}
                  value={username}
                />
              </Box>
              <Box mt={1}>
                <Button
                  color="primary"
                  disabled={saving}
                  onClick={() => void saveUsernameButton_click()}
                  variant="outlined"
                >
                  Save Username
                </Button>
                <Button
                  color="inherit"
                  onClick={() => setEditUsername(false)}
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
                Username: {account.username}
              </Typography>
              <Button
                sx={{ display: "inline", ml: 2 }}
                variant="outlined"
                size="small"
                onClick={() => setEditUsername(true)}
              >
                Change
              </Button>
            </>
          )}
        </Box>
        <Box mt={4}>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Role: {account.role}
          </Typography>
        </Box>
        <Box mt={8}>
          <Button color="error" variant="outlined">
            Delete Account
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
