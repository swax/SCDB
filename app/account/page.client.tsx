"use client";

import { showAndLogError } from "@/shared/utilities";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import type { user_role_type } from "@/database/generated/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import MuiNextLink from "../components/MuiNextLink";
import saveUsername from "./actions/saveAction";

interface AccountClientPageProps {
  id: string;
  email: string | null;
  username: string | null;
  role: user_role_type;
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

    const response = await saveUsername(username);

    if (response.error) {
      showAndLogError(response.error);
      setSaving(false);
      return;
    }

    // Triggers authOptions.ts jwt callback which updates the jwt/session with the new username
    await session.update();

    // reload page with next js
    window.location.reload();
  }

  // Rendering
  return (
    <Container>
      <Box style={{ marginTop: 32 }}>
        <Typography component="h1" variant="h4" align="center">
          My Account
        </Typography>
        <Typography component="div" variant="body1" style={{ marginTop: 32 }}>
          Email: {account.email}
        </Typography>
        <Typography component="div" variant="body2" color="textSecondary">
          Note: Your account is{" "}
          <MuiNextLink
            href="https://myaccount.google.com/connections"
            prefetch={false}
          >
            linked
          </MuiNextLink>{" "}
          to your Google account.
        </Typography>
        <Box style={{ marginTop: 32 }}>
          {editUsername || !username ? (
            <>
              <Box>
                <TextField
                  disabled={saving}
                  label="Username"
                  margin="normal"
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: "50%" }}
                  value={username}
                />
              </Box>
              <Box style={{ marginTop: 8 }}>
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
                  style={{ marginLeft: 8 }}
                  variant="outlined"
                >
                  Cancel
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography
                component="div"
                variant="body1"
                style={{ display: "inline" }}
              >
                Username: {account.username}
              </Typography>
              <Button
                style={{ display: "inline", marginLeft: 16 }}
                variant="outlined"
                size="small"
                onClick={() => setEditUsername(true)}
              >
                Change
              </Button>
            </>
          )}
        </Box>
        <Box style={{ marginTop: 32 }}>
          <Typography component="div" variant="body1" style={{ marginTop: 16 }}>
            Role: {account.role}
          </Typography>
        </Box>
        <Box style={{ marginTop: 64, marginBottom: 64 }}></Box>
        {/* Need to split profile from user table for this to work
         <Box style={{ marginTop: 64 }}>
          <Button color="error" variant="outlined">
            Delete Account
          </Button>
        </Box>
        */}
      </Box>
    </Container>
  );
}
