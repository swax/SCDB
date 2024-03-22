"use client";

import {
  TableEditConfig,
  TableEditField,
} from "@/backend/edit/tableConfigs/tableEditTypes";
import { useForceUpdate } from "@/frontend/hooks/useForceUpdate";
import DeleteIcon from "@mui/icons-material/Delete";
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
  Typography,
} from "@mui/material";
import { $Enums } from "@prisma/client";
import { useState } from "react";
import editAction from "./actions/editAction";
import AutocompleteLookup from "./components/AutocompleteLookup";
import DateField2 from "./components/DateField2";
import StringField from "./components/StringField";
import deleteAction from "./actions/deleteAction";

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
  function handleChange_enumField(
    field: TableEditField,
    index: number,
    value: Nullable<string>,
  ) {
    setFieldValue(field, index, value);

    forceUpdate();
  }

  async function handleClick_edit() {
    try {
      setLoading(true);
      const rowId = await editAction(editConfig, id);

      // If update refresh
      if (id) {
        window.location.reload();
      }
      // Else navigate to created row
      else {
        const url = `/edit/${editConfig.table}/${rowId}`;
        window.location.href = url;
      }
    } catch (e) {
      alert(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleClick_delete() {
    try {
      if (!confirm("Are you sure you want to delete this entry?")) return;

      setLoading(true);
      await deleteAction(editConfig, id);

      const url = `/edit/${editConfig.table}`;
      window.location.href = url;
    } catch (e) {
      alert(e);
    } finally {
      setLoading(false);
    }
  }

  function handleClick_deleteMappingRow(
    field: TableEditField,
    mappedIndex: number,
  ) {
    if (field.type != "mapping" || !field.mapping.ids) return;

    const removedId = field.mapping.ids.splice(mappedIndex, 1);
    field.mapping.removeIds ||= [];
    field.mapping.removeIds.push(removedId[0]);

    field.mapping.fields.forEach((mappedField) => {
      mappedField.values?.splice(mappedIndex, 1);
      mappedField.modified?.splice(mappedIndex, 1);

      if (mappedField.type === "lookup") {
        mappedField.lookup.values?.splice(mappedIndex, 1);
      }
    });

    forceUpdate();
  }

  function handleClick_addMappingRow(field: TableEditField) {
    if (field.type != "mapping") return;

    field.mapping.ids ||= [];
    const minId = Math.min(...field.mapping.ids, 0);
    field.mapping.ids.push(minId - 1);

    field.mapping.fields.forEach((mappedField) => {
      mappedField.values?.push(null);
    });

    forceUpdate();
  }

  // Helpers
  function setFieldValue(field: TableEditField, index: number, value: any) {
    field.values ||= [];
    field.values[index] = value;

    field.modified ||= [];
    field.modified[index] = true;
  }

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Rendering
  function renderField(field: TableEditField, index: number, inTable = false) {
    return (
      <Box sx={{ marginTop: inTable ? 0 : 3 }}>
        {field.type == "string" && (
          <StringField
            field={field}
            index={index}
            inTable={inTable}
            loading={loading}
            setFieldValue={setFieldValue}
          />
        )}
        {field.type == "date" && (
          <DateField2
            field={field}
            index={index}
            inTable={inTable}
            loading={loading}
            setFieldValue={setFieldValue}
          />
        )}
        {field.type === "enum" && (
          <Select
            fullWidth
            label={inTable ? "" : field.name}
            onChange={(e) =>
              handleChange_enumField(field, index, e.target.value)
            }
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
      <Typography variant="h5">
        {capitalizeFirstLetter(editConfig.operation || "") +
          " " +
          capitalizeFirstLetter(editConfig.name)}
      </Typography>
      {editConfig.fields.map((field, i) => (
        <Box key={i}>{renderField(field, 0)}</Box>
      ))}
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "start", marginTop: 4 }}
      >
        <Button
          color="success"
          disabled={loading}
          onClick={() => handleClick_edit()}
          variant="outlined"
        >
          {editConfig.operation == "update"
            ? "Save Changes"
            : editConfig.operation == "create"
            ? "Create"
            : "unknown"}
        </Button>
        {editConfig.operation == "update" && (
          <Button
            color="error"
            disabled={loading}
            onClick={() => handleClick_delete()}
            variant="outlined"
          >
            Delete Entry
          </Button>
        )}
      </Stack>
    </>
  );
}
