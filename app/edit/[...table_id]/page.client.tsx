"use client";

import { FieldOrm, TableOrm } from "@/database/orm/ormTypes";
import { useForceUpdate } from "@/frontend/hooks/useForceUpdate";
import { resolveTemplateVars, slugifyForUrl } from "@/shared/string";
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
  TextField,
  Typography,
} from "@mui/material";
import { $Enums } from "@prisma/client";
import { useState } from "react";
import deleteAction from "./actions/deleteAction";
import editAction from "./actions/editAction";
import AutocompleteLookup from "./components/AutocompleteLookup";
import DateField2 from "./components/DateField2";
import NumberField from "./components/NumberField";
import StringField from "./components/StringField";

interface EditClientPageProps {
  table: TableOrm;
  id: number;
}

export default function EditClientPage({ table, id }: EditClientPageProps) {
  // Hooks
  const forceUpdate = useForceUpdate();
  const [loading, setLoading] = useState(false);

  // Event Handlers
  function handleChange_enumField(
    field: FieldOrm,
    index: number,
    value: Nullable<string>,
  ) {
    setFieldValue(field, index, value);

    forceUpdate();
  }

  async function handleClick_save() {
    try {
      setLoading(true);
      const rowId = await editAction(table, id);

      // If update refresh
      if (id) {
        window.location.reload();
      }
      // Else navigate to created row
      else {
        const url = `/edit/${table.name}/${rowId}`;
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
      await deleteAction(table, id);

      const url = `/edit/${table.name}`;
      window.location.href = url;
    } catch (e) {
      alert(e);
    } finally {
      setLoading(false);
    }
  }

  function handleClick_deleteMappingRow(field: FieldOrm, mappedIndex: number) {
    if (field.type != "mapping" || !field.mappingTable.ids) return;

    const removedId = field.mappingTable.ids.splice(mappedIndex, 1);
    field.mappingTable.removeIds ||= [];
    field.mappingTable.removeIds.push(removedId[0]);

    field.mappingTable.fields.forEach((mappedField) => {
      mappedField.values?.splice(mappedIndex, 1);
      mappedField.modified?.splice(mappedIndex, 1);

      if (mappedField.type === "lookup") {
        mappedField.lookup.labelValues?.splice(mappedIndex, 1);
      }
    });

    forceUpdate();
  }

  function handleClick_addMappingRow(field: FieldOrm) {
    if (field.type != "mapping") return;

    field.mappingTable.ids ||= [];
    const minId = Math.min(...field.mappingTable.ids, 0);
    field.mappingTable.ids.push(minId - 1);

    field.mappingTable.fields.forEach((mappedField) => {
      mappedField.values?.push(null);
    });

    forceUpdate();
  }

  // Helpers
  function setFieldValue(field: FieldOrm, index: number, value: any) {
    field.values ||= [];
    field.values[index] = value;

    field.modified ||= [];
    field.modified[index] = true;

    forceUpdate();

    // Update template values
    if (!field.template) {
      table.fields.forEach((templateField) => {
        if (!templateField.template) return;

        const originalValue = templateField.values?.[index] || "";
        let newValue = "";

        try {
          newValue = resolveTemplateVars(
            templateField.template,
            table.name,
            getFieldForTemplate(index),
          );
        } catch {}

        if (originalValue == newValue) {
          return;
        }

        setFieldValue(templateField, index, newValue);
      });
    }

    // Update slug values
    if (field.type != "slug") {
      table.fields.forEach((slugField) => {
        if (slugField.type != "slug") return;

        slugField.values ||= [];

        const originalValue = slugField.values[index] || "";

        const derivedField = table.fields.find(
          (f) => f.column == slugField.derivedFrom,
        );

        const newValue = slugifyForUrl(
          (derivedField?.values?.[index] || "").toString(),
        );

        if (originalValue == newValue) {
          return;
        }

        setFieldValue(slugField, index, newValue);
      });
    }
  }

  function getFieldForTemplate(index: number) {
    const field: any = {};

    table.fields.forEach((f) => {
      if (f.column) {
        field[f.column] = f.values?.[index];
      }
      if (f.type == "lookup") {
        if (!field[f.lookup.table]) {
          field[f.lookup.table] = {};
        }
        field[f.lookup.table][f.lookup.labelColumn] =
          f.lookup.labelValues?.[index];
      }
    });

    return field;
  }

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Rendering
  function renderField(field: FieldOrm, index: number, inTable = false) {
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
        {field.type == "number" && (
          <NumberField
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
            error={!field.optional && !field.values?.[index]}
            fullWidth
            label={inTable ? "" : field.label}
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
        {field.type == "slug" && (
          <TextField
            disabled={true}
            fullWidth
            helperText={field.helperText}
            label="URL Slug"
            value={field.values?.[index] || ""}
            variant="standard"
          />
        )}
        {field.type === "lookup" && (
          <AutocompleteLookup
            field={field}
            index={index}
            inTable={inTable}
            setFieldValue={setFieldValue}
          />
        )}
        {field.type === "mapping" && (
          <>
            {field.mappingTable?.ids?.length && (
              <Table>
                <TableHead>
                  <TableRow>
                    {field.mappingTable?.fields.map(
                      (mappedField, fieldIndex) => (
                        <TableCell key={fieldIndex}>
                          {mappedField.label}
                        </TableCell>
                      ),
                    )}
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {field.mappingTable?.ids?.map((mappedId, mappedIndex) => (
                    <TableRow key={mappedId}>
                      {field.mappingTable?.fields.map(
                        (mappedField, fieldIndex) => (
                          <TableCell key={fieldIndex}>
                            {renderField(mappedField, mappedIndex, true)}
                          </TableCell>
                        ),
                      )}
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
            )}
            <Button
              disabled={loading}
              onClick={() => handleClick_addMappingRow(field)}
              sx={{ marginLeft: 2, marginTop: 2 }}
              variant="outlined"
            >
              Add {field.label}
            </Button>
          </>
        )}
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h5">
        {capitalizeFirstLetter(table.operation || "") +
          " " +
          capitalizeFirstLetter(table.label)}
      </Typography>
      {table.fields.map((field, i) => (
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
          onClick={() => handleClick_save()}
          variant="outlined"
        >
          {table.operation == "update"
            ? "Save Changes"
            : table.operation == "create"
              ? "Create"
              : "unknown"}
        </Button>
        {table.operation == "update" && (
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
