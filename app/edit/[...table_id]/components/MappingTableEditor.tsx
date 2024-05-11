import { useForceUpdate } from "@/app/hooks/useForceUpdate";
import { FieldOrm, MappingTableOrm } from "@/database/orm/ormTypes";
import s3url from "@/shared/cdnHost";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton/IconButton";
import Image from "next/image";
import { useState } from "react";
import EditableField from "./EditableField";

interface MappingTableEditorProps {
  label: string;
  mappingTable: MappingTableOrm;
  loading: boolean;
  setFieldValue: (field: FieldOrm, index: number, value: any) => void;
}

export default function MappingTableEditor({
  label,
  mappingTable,
  loading,
  setFieldValue,
}: MappingTableEditorProps) {
  // Hooks
  const forceUpdate = useForceUpdate();

  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [editMappingRowIndex, setEditDialogMappingRowIndex] =
    useState<number>();

  // Event Handlers
  function handleClick_openEditMappingDialog(mappingRowIndex: number) {
    setShowMappingDialog(true);
    setEditDialogMappingRowIndex(mappingRowIndex);
  }

  function handleClick_deleteMappingRow(mappedIndex: number) {
    if (!mappingTable.ids) {
      return;
    }

    const removedId = mappingTable.ids.splice(mappedIndex, 1)[0];
    mappingTable.removeIds ||= [];

    if (removedId >= 0) {
      mappingTable.removeIds.push(removedId);
    }

    mappingTable.fields.forEach((mappedField) => {
      mappedField.values?.splice(mappedIndex, 1);
      mappedField.modified?.splice(mappedIndex, 1);

      if (mappedField.type === "lookup") {
        mappedField.lookup.labelValues?.splice(mappedIndex, 1);
      }
    });

    forceUpdate();
  }

  function handleClick_addMappingRow() {
    if (!mappingTable.ids) {
      return;
    }

    const minId = Math.min(...mappingTable.ids, 0);
    mappingTable.ids.push(minId - 1);

    mappingTable.fields.forEach((mappedField) => {
      mappedField.values ||= [];
      mappedField.values.push(null);
    });

    if (!mappingTable.inline) {
      setShowMappingDialog(true);
      setEditDialogMappingRowIndex(mappingTable.ids.length - 1);
    }

    forceUpdate();
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

  return (
    <>
      <Typography variant="h6">{label}</Typography>
      {Boolean(mappingTable.ids?.length) && (
        <Table size="small">
          <TableHead>
            <TableRow>
              {mappingTable.fields.map((mappedField, fieldIndex) => (
                <TableCell key={fieldIndex}>
                  <Box sx={{ color: "grey" }}>{mappedField.label}</Box>
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {mappingTable.ids?.map((mappedId, mappedIndex) => (
              <TableRow key={mappedId}>
                {mappingTable?.fields.map((mappedField, fieldIndex) => (
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
                    {mappingTable.inline ? (
                      <EditableField
                        tableName={mappingTable.name}
                        field={mappedField}
                        index={mappedIndex}
                        inTable={true}
                        loading={loading}
                        setFieldValue={setFieldValue}
                      />
                    ) : (
                      renderViewField(mappedField, mappedIndex, true)
                    )}
                  </TableCell>
                ))}
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {!mappingTable.inline && (
                    <IconButton
                      aria-label="edit"
                      onClick={() =>
                        handleClick_openEditMappingDialog(mappedIndex)
                      }
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleClick_deleteMappingRow(mappedIndex)}
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
        onClick={() => handleClick_addMappingRow()}
        size="small"
        sx={{ marginLeft: 2, marginTop: 2 }}
        variant="outlined"
      >
        Add
      </Button>

      {/* Edit mappped field dialog */}
      <Dialog
        fullWidth
        open={showMappingDialog}
        onClose={() => setShowMappingDialog(false)}
      >
        <DialogTitle>Edit {label}</DialogTitle>
        <DialogContent>
          {mappingTable.fields.map((field, i) => (
            <Box key={i}>
              <EditableField
                tableName={mappingTable.name}
                field={field}
                index={editMappingRowIndex!}
                inTable={false}
                loading={loading}
                setFieldValue={setFieldValue}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            disabled={loading}
            onClick={() => setShowMappingDialog(false)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
