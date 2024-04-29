"use client"

import { Button, TextField } from "@mui/material";
import { signOut } from "next-auth/react";
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

  // Events
  async function saveUsernameButton_click() {
    if (!username) {
      return;
    }

    setSaving(true);

    await saveUsername(username);

    setSaving(false);
  }

  // Rendering
  return (
    <div>
      <h1>My Account</h1>
      <p>Linked to Google</p>
      <p>Email: {account.email}</p>
      <p>Username:</p>
      <TextField
        defaultValue={username}
        onChange={(e) => setUsername(e.target.value)}
        onBlur={(e) => setUsername(e.target.value)}
        variant="outlined"
      />
      <p>
        <Button
          disabled={!Boolean(username) || saving}
          variant="contained"
          onClick={saveUsernameButton_click}
        >
          Save Username
        </Button>
      </p>
      <p>
        <Button onClick={() => void signOut()} variant="contained">
          Logout
        </Button>
      </p>
      <p>
        <Button color="error" variant="contained">
          TODO: Delete Account
        </Button>
      </p>
    </div>
  );
}
