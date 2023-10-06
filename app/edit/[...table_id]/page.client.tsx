"use client";

import {
  TableEditConfig,
  TableEditField,
} from "@/backend/edit/tableEditConfigs";
import { useForceUpdate } from "@/frontend/hooks/useForceUpdate";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField
} from "@mui/material";
import { $Enums } from "@prisma/client";
import { useState } from "react";
import AutocompleteLookup from "./AutocompleteLookup";
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
  function handleChange_field(
    field: TableEditField,
    index: number,
    value: string
  ) {
    field.newValues ||= [];
    field.newValues[index] = value;
    forceUpdate();
  }

  async function handleClick_edit() {
    try {
      setLoading(true);
      await editAction(editConfig, id);
      setLoading(false);

      // redirect back to sketch page when done
      // window.location.href = `/sketches/${id}/placeholder`;
    } catch (e) {
      alert(e);
      setLoading(false);
    }
  }

  function handleClick_delete() {}

  // Rendering
  let nextElementId = 1;

  function renderField(field: TableEditField, index: number, inTable = false) {
    return (
      <Box sx={{ marginTop: inTable ? 0 : 2 }}>
        {["boolean", "string", "number"].includes(field.type) && (
          <TextField
            disabled={loading}
            helperText={field.helperText}
            label={inTable ? "" : field.name}
            onChange={(e) => handleChange_field(field, index, e.target.value)}
            value={field.newValues?.[index] || field.values?.[index] || ""}
            variant="standard"
          />
        )}
        {field.type === "enum" && (
          <Select
            fullWidth
            label={inTable ? "" : field.name}
            onChange={(e) => handleChange_field(field, index, e.target.value)}
            size="small"
            value={
              (field.newValues?.[index] ||
                field.values?.[index] ||
                "") as string
            }
          >
            <MenuItem value="none">
              <i>Select...</i>
            </MenuItem>
            {Object.keys(($Enums as any)[field.enum!]).map((value, i) => (
              <MenuItem key={i} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        )}
        {field.type === "lookup" && (
          <AutocompleteLookup field={field} index={index} inTable={inTable} />
        )}
        {field.type === "mapping" && (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  {field.mapping?.fields.map((mappedField, fieldIndex) => (
                    <TableCell key={fieldIndex}>{mappedField.name}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(field.mapping?.count)].map((x, mappedIndex) => (
                  <TableRow key={mappedIndex}>
                    {field.mapping?.fields.map((mappedField, fieldIndex) => (
                      <TableCell key={fieldIndex}>
                        {renderField(mappedField, mappedIndex, true)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Box>
    );
  }

  return (
    <>
      <Box>{editConfig.operation + " " + editConfig.table}</Box>
      {editConfig.fields.map((field, i) => (
        <Box key={i}>{renderField(field, 0)}</Box>
      ))}

      <Stack spacing={2} sx={{ marginTop: 2 }}>
        <Button
          color="success"
          disabled={loading}
          onClick={() => handleClick_edit()}
          variant="outlined"
        >
          Save Changes
        </Button>
        <Button
          color="error"
          disabled={loading}
          onClick={() => handleClick_delete()}
          variant="outlined"
        >
          Delete Entry
        </Button>
      </Stack>
    </>
  );
}
