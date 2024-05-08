"use client";

import { FieldOrm, MappingEditField, TableOrm } from "@/database/orm/ormTypes";
import { useForceUpdate } from "@/app/hooks/useForceUpdate";
import s3url from "@/shared/cdnHost";
import { resolveTemplateVars, slugifyForUrl } from "@/shared/stringUtils";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { $Enums, review_status_type } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import deleteAction from "./actions/deleteAction";
import editAction from "./actions/editAction";
import { updateReviewStatus } from "./actions/reviewAction";
import DateField2 from "./components/DateField2";
import ImageField from "./components/ImageField";
import ListField from "./components/ListField";
import LookupField from "./components/LookupField";
import NumberField from "./components/NumberField";
import StringField from "./components/StringField";

interface EditClientPageProps {
  table: TableOrm;
  id: number;
}

export default function EditClientPage({ table, id }: EditClientPageProps) {
  const pageTitle =
    resolveTemplateVars(table.title, table.name, getFieldForTemplate(0)) +
    " - SketchTV.lol";

  // Hooks
  const forceUpdate = useForceUpdate();
  const [loading, setLoading] = useState(false);

  const [editMappingField, setEditDialogMappingField] =
    useState<MappingEditField>();
  const [editMappingRowIndex, setEditDialogMappingRowIndex] =
    useState<number>();

  const [reviewStatus, setReviewStatus] = useState(table.reviewStatus);
  const [updatingReviewStatus, setUpdatingReviewStatus] = useState(false);

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

  function handleClick_openEditMappingDialog(
    mappingField: MappingEditField,
    mappingRowIndex: number,
  ) {
    setEditDialogMappingField(mappingField);
    setEditDialogMappingRowIndex(mappingRowIndex);
  }

  function handleClick_deleteMappingRow(field: FieldOrm, mappedIndex: number) {
    if (field.type != "mapping" || !field.mappingTable.ids) return;

    const removedId = field.mappingTable.ids.splice(mappedIndex, 1)[0];
    field.mappingTable.removeIds ||= [];

    if (removedId >= 0) {
      field.mappingTable.removeIds.push(removedId);
    }

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
    if (field.type != "mapping" || !field.mappingTable.ids) return;

    const minId = Math.min(...field.mappingTable.ids, 0);
    field.mappingTable.ids.push(minId - 1);

    field.mappingTable.fields.forEach((mappedField) => {
      mappedField.values ||= [];
      mappedField.values.push(null);
    });

    if (!field.mappingTable.inline) {
      setEditDialogMappingField(field);
      setEditDialogMappingRowIndex(field.mappingTable.ids.length - 1);
    }

    forceUpdate();
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

    forceUpdate();

    // Update template values
    if (!field.template) {
      table.fields.forEach((templateField) => {
        if (!templateField.template) return;

        const originalValue = templateField.values?.[index] || "";
        let newValue = "";

        newValue = resolveTemplateVars(
          templateField.template,
          table.name,
          getFieldForTemplate(index),
        );

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
  function renderViewField(field: FieldOrm, index: number, inTable = false) {
    let color: string | undefined;
    let value = field.values?.[index];

    if (field.type == "lookup") {
      value = field.lookup.labelValues?.[index];
    }

    if (!field.optional && !value) {
      color = "red";
      value =
        value === ""
          ? "<empty>"
          : value === null
            ? "<null>"
            : value === undefined
              ? "<undefined>"
              : "<unknown>";
    }

    if (field.type == "image") {
      const cdnKey = field.values?.[index] || "";

      return (
        <>
          {cdnKey ? (
            <Image
              alt="Alt text generated dynamically on view page"
              height={50}
              src={`${s3url}/${cdnKey}`}
              style={{ objectFit: "cover" }}
              unoptimized={true /* Not optimized in edit mode */}
              width={50}
            />
          ) : (
            <></>
          )}
        </>
      );
    }

    return (
      <Box sx={{ marginTop: inTable ? 0 : 3, color }}>{`${value || ""}`}</Box>
    );
  }

  function renderEditField(
    tableName: string,
    field: FieldOrm,
    index: number,
    inTable = false,
  ) {
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
        {field.type == "list" && (
          <ListField
            field={field}
            index={index}
            inTable={inTable}
            loading={loading}
            setFieldValue={setFieldValue}
          />
        )}
        {field.type == "image" && (
          <ImageField
            field={field}
            index={index}
            inTable={inTable}
            loading={loading}
            setFieldValue={setFieldValue}
            tableName={tableName}
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
            size="small"
            value={field.values?.[index] || ""}
            variant="outlined"
          />
        )}
        {field.type === "lookup" && (
          <LookupField
            field={field}
            index={index}
            inTable={inTable}
            setFieldValue={setFieldValue}
          />
        )}
        {field.type === "mapping" && (
          <>
            <Typography variant="h6">{field.label}</Typography>
            {Boolean(field.mappingTable.ids?.length) && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {field.mappingTable.fields.map(
                      (mappedField, fieldIndex) => (
                        <TableCell key={fieldIndex}>
                          <Box sx={{ color: "grey" }}>{mappedField.label}</Box>
                        </TableCell>
                      ),
                    )}
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {field.mappingTable.ids?.map((mappedId, mappedIndex) => (
                    <TableRow key={mappedId}>
                      {field.mappingTable?.fields.map(
                        (mappedField, fieldIndex) => (
                          <TableCell
                            key={fieldIndex}
                            sx={{
                              ...(mappedField.fillWidth
                                ? {
                                    width: "100%",
                                  }
                                : {
                                    whiteSpace: "nowrap",
                                  }),
                            }}
                          >
                            {field.mappingTable.inline
                              ? renderEditField(
                                  field.mappingTable.name,
                                  mappedField,
                                  mappedIndex,
                                  true,
                                )
                              : renderViewField(mappedField, mappedIndex, true)}
                          </TableCell>
                        ),
                      )}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {!field.mappingTable.inline && (
                          <IconButton
                            aria-label="edit"
                            onClick={() =>
                              handleClick_openEditMappingDialog(
                                field,
                                mappedIndex,
                              )
                            }
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        <IconButton
                          aria-label="delete"
                          onClick={() =>
                            handleClick_deleteMappingRow(field, mappedIndex)
                          }
                          size="small"
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
              size="small"
              sx={{ marginLeft: 2, marginTop: 2 }}
              variant="outlined"
            >
              Add
            </Button>
          </>
        )}
      </Box>
    );
  }

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
        <Box key={i}>{renderEditField(table.name, field, 0)}</Box>
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

      {/* Edit mappped field dialog */}
      <Dialog
        fullWidth
        open={!!editMappingField}
        onClose={() => setEditDialogMappingField(undefined)}
      >
        <DialogTitle>Edit {editMappingField?.label}</DialogTitle>
        <DialogContent>
          {editMappingField?.mappingTable.fields.map((field, i) => (
            <Box key={i}>
              {renderEditField(
                editMappingField.mappingTable.name,
                field,
                editMappingRowIndex!,
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            disabled={loading}
            onClick={() => setEditDialogMappingField(undefined)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
