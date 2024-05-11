"use client";

import { useForceUpdate } from "@/app/hooks/useForceUpdate";
import { FieldOrm, TableOrm } from "@/database/orm/ormTypes";
import {
  fillHolesWithNullInPlace,
  resolveTemplateVars,
  slugifyForUrl,
} from "@/shared/utilities";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Fab,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { review_status_type } from "@prisma/client";
import { useState } from "react";
import deleteAction from "./actions/deleteAction";
import editAction from "./actions/editAction";
import { updateReviewStatus } from "./actions/reviewAction";
import EditableField from "./components/EditableField";

interface EditClientPageProps {
  table: TableOrm;
  id: number;
}

export default function EditClientPage({ table, id }: EditClientPageProps) {
  const pageTitle =
    resolveTemplateVars(table.title, getFieldForTemplate(0)) +
    " - SketchTV.lol";

  // Hooks
  const forceUpdate = useForceUpdate();
  const [loading, setLoading] = useState(false);

  const [reviewStatus, setReviewStatus] = useState(table.reviewStatus);
  const [updatingReviewStatus, setUpdatingReviewStatus] = useState(false);

  // Event Handlers
  async function handleClick_save() {
    setLoading(true);

    const response = await editAction(table, id);

    if (response.error || !response.content) {
      alert(response.error || "Unknown error");
      setLoading(false);
      return;
    }

    const rowId = response.content;

    // If update refresh
    if (id) {
      window.location.reload();
    }
    // Else navigate to created row
    else {
      const url = `/edit/${table.name}/${rowId}`;
      window.location.href = url;
    }
  }

  async function handleClick_delete() {
    if (!confirm(`Are you sure you want to delete this ${table.label}?`))
      return;

    setLoading(true);

    const response = await deleteAction(table, id);

    if (response.error) {
      alert(response.error);
      setLoading(false);
    } else {
      window.location.href = `/edit/${table.name}`;
    }
  }

  async function reviewStatusSelect_change(e: SelectChangeEvent) {
    const newStatus = e.target.value as review_status_type;

    if (newStatus === reviewStatus) {
      return;
    }

    setUpdatingReviewStatus(true);

    const response = await updateReviewStatus(table, id, newStatus);

    if (response.error) {
      alert(response.error);
    } else {
      setReviewStatus(newStatus);
    }

    setUpdatingReviewStatus(false);
  }

  // Helpers
  function setFieldValue(field: FieldOrm, index: number, value: any) {
    field.values ||= [];
    field.values[index] = value;

    field.modified ||= [];
    field.modified[index] = true;

    // Set empty/undefined values in array to null as postgres cant write json arrays with undefined entries to the audit table
    // @ts-expect-error - Values is a union of many types and TS can't figure it out
    fillHolesWithNullInPlace(field.values);
    fillHolesWithNullInPlace(field.modified);

    forceUpdate();

    // If this isn't a template field itself
    // Update template fields that may reference this value
    if (!field.templates) {
      table.fields.forEach((templateField) => {
        if (templateField.templates) {
          updateTemplateField(templateField, index);
        }
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

  function updateTemplateField(templateField: FieldOrm, index: number) {
    const originalValue = templateField.values?.[index] || "";

    for (const template of templateField.templates || []) {
      const newValue = resolveTemplateVars(
        template,
        getFieldForTemplate(index),
      );

      if (!newValue) {
        continue;
      }

      if (originalValue == newValue) {
        return;
      }

      setFieldValue(templateField, index, newValue);
      return;
    }

    // If no template matched, clear the value
    setFieldValue(templateField, index, "");
  }

  function getFieldForTemplate(index: number) {
    const field: Record<string, any> = {};

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
  const reviewStatusBorderColor =
    reviewStatus == review_status_type.NeedsReview
      ? "orange"
      : reviewStatus == review_status_type.Flagged
        ? "red"
        : reviewStatus == review_status_type.Reviewed
          ? "limegreen"
          : "pink";

  return (
    <>
      <title>{pageTitle}</title>
      <Typography variant="h5">
        {capitalizeFirstLetter(table.operation || "") +
          " " +
          capitalizeFirstLetter(table.label)}
      </Typography>

      {/* Render fields */}
      {table.fields.map((field, i) => (
        <Box key={i}>
          <EditableField
            tableName={table.name}
            field={field}
            index={0}
            inTable={false}
            loading={loading}
            setFieldValue={setFieldValue}
          />
        </Box>
      ))}

      {/* Space so the buttons don't cover the last field at the bototm of the page */}
      <Box sx={{ height: 64 }}></Box>

      {/* Create, update, delete */}
      <Box
        sx={{
          bottom: 8,
          position: "fixed",
          right: 8,
        }}
      >
        {Boolean(table.reviewStatus) && table.operation == "update" && (
          <Select
            disabled={updatingReviewStatus}
            onChange={(e) => void reviewStatusSelect_change(e)}
            size="small"
            color="warning"
            sx={{
              mr: 1,
              // wtf is it so hard to color the border of a select?
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: reviewStatusBorderColor,
              },
              "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: reviewStatusBorderColor,
                },
              "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: reviewStatusBorderColor,
                },
            }}
            value={reviewStatus}
          >
            <MenuItem value={review_status_type.NeedsReview}>
              ⚠️ Needs Review
            </MenuItem>
            <MenuItem value={review_status_type.Flagged}>🚩 Flagged</MenuItem>
            <MenuItem value={review_status_type.Reviewed}>👍 Reviewed</MenuItem>
          </Select>
        )}
        <Fab
          color="primary"
          disabled={loading}
          onClick={() => void handleClick_save()}
          sx={{ mr: 1 }}
          variant="extended"
        >
          <SaveIcon />
          {table.operation == "update"
            ? "Save"
            : table.operation == "create"
              ? "Create"
              : "unknown"}
        </Fab>
        {table.operation == "update" && (
          <Fab
            disabled={loading}
            onClick={() => void handleClick_delete()}
            variant="extended"
          >
            <DeleteIcon />
          </Fab>
        )}
      </Box>
    </>
  );
}
