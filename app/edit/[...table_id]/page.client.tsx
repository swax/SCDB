"use client";

import { TableEditConfig, TableEditField } from "@/backend/services/edit";
import { useForceUpdate } from "@/frontend/hooks/use-force-update";
import { Box, FormControl, TextField } from "@mui/material";

interface EditClientPageProps {
  editConfig: TableEditConfig;
}

export default function EditClientPage(props: EditClientPageProps) {
  // Hooks
  const forceUpdate = useForceUpdate();

  // Event Handlers
  function updateField(field: TableEditField, value: string) {
    field.newValue = value;
    forceUpdate();
  }

  // Rendering
  return (
    <>
      <Box>{props.editConfig.operation + " Row"}</Box>
      {props.editConfig.fields.map((field, i) => (
        <Box key={i}>
          <FormControl sx={{ marginTop: 2 }}>
            <TextField
              aria-describedby={`help-${i}`}
              helperText={field.helperText}
              id={`input-${i}`}
              label={field.name}
              onChange={(e) => updateField(field, e.target.value)}
              value={field.newValue || ""}
              variant="standard"
            />
          </FormControl>
        </Box>
      ))}
    </>
  );
}
