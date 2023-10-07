"use client";

import {
  TableEditConfig,
  TableEditField,
} from "@/backend/edit/tableEditConfigs";
import { useForceUpdate } from "@/frontend/hooks/useForceUpdate";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { $Enums } from "@prisma/client";
import { useState } from "react";
import AutocompleteLookup from "./AutocompleteLookup";
import editAction from "./editAction";
import DeleteIcon from "@mui/icons-material/Delete";

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
    field.values![index] = value;
    field.modified ||= [];
    field.modified[index] = true;
    forceUpdate();
  }

  async function handleClick_edit() {
    try {
      setLoading(true);
      await editAction(editConfig, id);
      setLoading(false);

      // refresh page
      window.location.reload();
    } catch (e) {
      alert(e);
      setLoading(false);
    }
  }

  function handleClick_deleteMappingRow(
    field: TableEditField,
    mappedIndex: number
  ) {
    if (!field.mapping || !field.mapping.ids) return;

    const removedId = field.mapping.ids.splice(mappedIndex, 1);
    field.mapping.removeIds ||= [];
    field.mapping.removeIds.push(removedId[0]);

    field.mapping.fields.forEach((mappedField) => {
      mappedField.values?.splice(mappedIndex, 1);
      mappedField.modified?.splice(mappedIndex, 1);
      mappedField.lookup?.values?.splice(mappedIndex, 1);
    });

    forceUpdate();
  }

  function handleClick_addMappingRow(field: TableEditField) {
    if (!field.mapping || !field.mapping.ids) return;

    const minId = Math.min(...field.mapping.ids, 0);
    field.mapping.ids.push(minId - 1);

    field.mapping.fields.forEach((mappedField) => {
      mappedField.values?.push(undefined);
    });

    forceUpdate();
  }

  function handleClick_delete() {}

  // Rendering
  function renderField(field: TableEditField, index: number, inTable = false) {
    return (
      <Box sx={{ marginTop: inTable ? 0 : 3 }}>
        {["boolean", "string", "number"].includes(field.type) && (
          <TextField
            disabled={loading}
            helperText={field.helperText}
            label={inTable ? "" : field.name}
            onChange={(e) => handleChange_field(field, index, e.target.value)}
            value={field.values?.[index] || ""}
            variant="standard"
          />
        )}
        {field.type === "enum" && (
          <Select
            fullWidth
            label={inTable ? "" : field.name}
            onChange={(e) => handleChange_field(field, index, e.target.value)}
            size="small"
            value={(field.values?.[index] || "") as string}
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
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {field.mapping?.ids?.map((mappedId, mappedIndex) => (
                  <TableRow key={mappedId}>
                    {field.mapping?.fields.map((mappedField, fieldIndex) => (
                      <TableCell key={fieldIndex}>
                        {renderField(mappedField, mappedIndex, true)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <IconButton
                        aria-label="delete"
                        onClick={() =>
                          handleClick_deleteMappingRow(field, mappedIndex)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              color="success"
              disabled={loading}
              onClick={() => handleClick_addMappingRow(field)}
              sx={{ marginLeft: 2, marginTop: 2 }}
              variant="outlined"
            >
              Add {field.name}
            </Button>
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

      <Stack spacing={4} sx={{ marginTop: 4 }}>
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
