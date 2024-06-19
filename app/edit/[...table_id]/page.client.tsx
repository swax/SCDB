"use client";

import { useForceUpdate } from "@/app/hooks/useForceUpdate";
import {
  FieldOrm,
  FieldOrmValueType,
  SlugFieldOrm,
  TableOrm,
} from "@/database/orm/ormTypes";
import { getEditUrl } from "@/shared/urls";
import {
  capitalizeFirstLetter,
  fillHolesWithNullInPlace,
  resolveTemplateVars,
  showAndLogError,
  slugifyForUrl,
} from "@/shared/utilities";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Fab,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import { review_status_type } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useBeforeUnload, useEffectOnce } from "react-use";
import deleteAction from "./actions/deleteAction";
import editAction from "./actions/editAction";
import { updateReviewStatus } from "./actions/reviewAction";
import EditableField from "./components/EditableField";

interface EditClientPageProps {
  table: TableOrm;
  id: number;
  slug: string;
}

export default function EditClientPage({
  table,
  id,
  slug,
}: EditClientPageProps) {
  /*
   * HACK: This page modifies the table object directly during the editing process
   * It works fine, but for some reason, after a server action runs, the table object is reset to its original state
   * This ensures that the table object is never modified by React/Next after the client page loads
   * To see this happen, remove this code and then add a new sketch with just the title set to 'xyz'
   * Then click save and you will get an error message, after the error message, the page will reset and title field cleared
   * This also fixes a strange bug where after save, all the fields would blank out briefly
   */
  table = useMemo(() => ({ ...table }), []);

  // Hooks
  const [loading, setLoading] = useState(false);
  const forceUpdate = useForceUpdate();

  const [reviewStatus, setReviewStatus] = useState(table.reviewStatus);
  const [updatingReviewStatus, setUpdatingReviewStatus] = useState(false);

  const [changeState, setChangeState] = useState<
    "no-changes" | "dirty" | "saved"
  >("no-changes");

  const [createdRowId, setCreatedRowId] = useState<number | null>(null);

  useBeforeUnload(
    () => changeState == "dirty",
    "Are you sure you want to leave? You have unsaved changes.",
  );

  useEffectOnce(() => {
    updateLookupSearchPrefixes(table, 0);
  });

  useEffect(() => {
    if (changeState == "saved") {
      // If updated refresh
      if (id) {
        window.location.reload();
      }
      // Else navigate to added row
      else if (createdRowId) {
        const url = getEditUrl(table.name, createdRowId);
        window.location.href = url;
      } else {
        alert("Error: No ID or createdRowId to navigate to.");
      }
    }
  }, [changeState]);

  // Event Handlers
  async function handleClick_save() {
    if (changeState == "no-changes") {
      alert("You have no changes to save.");
      return;
    }

    setLoading(true);

    const response = await editAction(table, id, slug);

    if (response.error || !response.content) {
      showAndLogError(response.error || "Unknown error");
      setLoading(false);
      return;
    }

    const rowId = response.content.rowId;

    if (!id) {
      setCreatedRowId(rowId);
    }

    setChangeState("saved");

    // Will trigger a useEffect refresh
    // Can't just refresh here because useBeforeUnload() hook needs the new state
  }

  async function handleClick_delete() {
    if (!confirm(`Are you sure you want to delete this ${table.label}?`))
      return;

    setLoading(true);

    const response = await deleteAction(table, id, slug);

    if (response.error) {
      showAndLogError(response.error);
      setLoading(false);
    } else {
      window.location.href = getEditUrl(table.name);
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
      showAndLogError(response.error);
    } else {
      setReviewStatus(newStatus);
    }

    setUpdatingReviewStatus(false);
  }

  // Helpers
  function setFieldValue(
    field: FieldOrm,
    index: number,
    value: FieldOrmValueType,
  ) {
    field.values ||= [];
    field.values[index] = value;

    field.modified ||= [];
    field.modified[index] = true;

    // Set empty/undefined values in array to null as postgres cant write json arrays with undefined entries to the audit table
    // @ts-expect-error - Values is a union of many types and TS can't figure it out
    fillHolesWithNullInPlace(field.values);
    fillHolesWithNullInPlace(field.modified);

    setDirty();

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
        if (slugField.type == "slug") {
          updateSlugField(slugField, index);
        }
      });
    }

    updateLookupSearchPrefixes(table, index);
  }

  function updateSlugField(slugField: SlugFieldOrm, index: number) {
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
  }

  function updateLookupSearchPrefixes(table: TableOrm, index: number) {
    table.fields.forEach((lookupField) => {
      if (lookupField.type == "lookup" && lookupField.lookup.prefixTemplate) {
        lookupField.lookup.prefixValue = getTemplateValue(
          lookupField.lookup.prefixTemplate,
          index,
        );
      }
    });
  }

  function updateTemplateField(templateField: FieldOrm, index: number) {
    const originalValue = templateField.values?.[index] || "";

    const newValue = getTemplateValue(templateField.templates || [], index);

    if (newValue != originalValue) {
      setFieldValue(templateField, index, newValue);
    }
  }

  function getTemplateValue(templates: string[], index: number) {
    for (const template of templates) {
      const newValue = resolveTemplateVars(
        template,
        getFieldForTemplate(index),
      );

      if (!newValue) {
        continue;
      }

      return newValue;
    }

    // If no template matched, clear the value
    return "";
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

  function setDirty() {
    setChangeState("dirty");
    forceUpdate(); // Ensures slugs and templates are updated
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

  let rowTitle = getTemplateValue(table.title, 0);
  const tableName = capitalizeFirstLetter(table.label);
  rowTitle ||= tableName;
  const pageTitle = rowTitle + " - SketchTV.lol";
  const addOrUpdate = table.operation == "update" ? "Edit " : "Add ";

  return (
    <>
      <title>{addOrUpdate + pageTitle}</title>
      <Typography variant="h5">{addOrUpdate + tableName}</Typography>

      {/* Render fields */}
      {table.fields.map((field, i) => (
        <Box key={i}>
          <EditableField
            tableName={table.name}
            tableRowCreated={table.operation == "update"}
            field={field}
            index={0}
            inTable={false}
            loading={loading}
            setFieldValue={setFieldValue}
            setDirty={setDirty}
          />
        </Box>
      ))}

      {/* Space so the buttons don't cover the last field at the bototm of the page */}
      <Box sx={{ height: 64 }}></Box>

      {/* Add, update, delete buttons */}
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
              backgroundColor: "black",
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
          color={changeState == "dirty" ? "primary" : "default"}
          disabled={loading}
          onClick={() => void handleClick_save()}
          sx={{ mr: 1 }}
          variant="extended"
        >
          <SaveIcon />
          {table.operation == "update"
            ? "Save"
            : table.operation == "create"
              ? "Add"
              : "unknown"}
        </Fab>
        {table.operation != "create" && (
          <Tooltip title={`Add a new ${table.label}`}>
            <Fab
              disabled={loading}
              href={getEditUrl(table.name)}
              sx={{ mr: 1 }}
              variant="extended"
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        )}
        {table.operation == "update" && (
          <Tooltip title={`Delete this ${table.label}`}>
            <Fab
              disabled={loading}
              onClick={() => void handleClick_delete()}
              variant="extended"
            >
              <DeleteIcon />
            </Fab>
          </Tooltip>
        )}
      </Box>
    </>
  );
}
