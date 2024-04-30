"use client";

import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import saveUsername from "./actions/saveAction";

interface AccountClientPageProps {
  id: string;
  email: string | null;
  username: string | null;
}

export default function AccountClientPage(account: AccountClientPageProps) {
  // State
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

    setSaving(false);
  }

  // Rendering
  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h4" align="center" gutterBottom>
          My Account
        </Typography>
        <Typography variant="body1" gutterBottom>
          Email: {account.email}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Note: Your account is linked to your Google account.
        </Typography>
        <Box mt={2}>
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
            variant="contained"
          >
            Save Username
          </Button>
          <Box mt={4}>
            <Button
              color="secondary"
              onClick={() => void signOut()}
              variant="outlined"
            >
              Logout
            </Button>
          </Box>
          <Box mt={16}>
            <Button color="error" variant="outlined">
              Delete Account
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
