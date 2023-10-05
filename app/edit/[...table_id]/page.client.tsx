"use client";

import {
  TableEditConfig,
  TableEditField,
} from "@/backend/edit/tableEditConfigs";
import { useForceUpdate } from "@/frontend/hooks/use-force-update";
import {
  Box,
  Button,
  FormControl,
  Stack,
  TextField
} from "@mui/material";
import { useState } from "react";
import AutocompleteRelation from "./AutocompleteRelation";
import editAction from "./editAction";

interface EditClientPageProps {
  editConfig: TableEditConfig;
  id: number;
}

export default function EditClientPage({
  editConfig,
  id,
}: EditClientPageProps) {
  // Hooks
  const forceUpdate = useForceUpdate();
  const [loading, setLoading] = useState(false);

  // Event Handlers
  function handleChange_field(field: TableEditField, value: string) {
    field.newValue = value;
    forceUpdate();
  }

  async function handleClick_edit() {
    try {
      setLoading(true);
      await editAction(editConfig, id);
      setLoading(false);

      // redirect back to sketch page when done
      window.location.href = `/sketches/${id}/placeholder`;
    } catch (e) {
      alert(e);
      setLoading(false);
    }
  }

  function handleClick_delete() {}

  // Rendering
  return (
    <>
      <Box>{editConfig.operation + " Row"}</Box>
      {editConfig.fields.map((field, i) => (
        <Box key={i}>
          <FormControl sx={{ marginTop: 2 }}>
            <TextField
              disabled={loading}
              helperText={field.helperText}
              id={`input-${i}`}
              label={field.name}
              onChange={(e) => handleChange_field(field, e.target.value)}
              value={field.newValue || ""}
              variant="standard"
            />
          </FormControl>
        </Box>
      ))}

      <AutocompleteRelation />

      <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
        <Button
          color="success"
          disabled={loading}
          onClick={() => handleClick_edit()}
          variant="outlined"
        >
          Edit
        </Button>
        <Button
          color="error"
          disabled={loading}
          onClick={() => handleClick_delete()}
          variant="outlined"
        >
          Delete
        </Button>
      </Stack>
    </>
  );
}