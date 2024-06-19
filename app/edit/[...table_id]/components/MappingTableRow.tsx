import { Draggable } from "@hello-pangea/dnd";
import { TableRow, TableCell, IconButton, Box } from "@mui/material";
import EditableField from "./EditableField";
import {
  FieldOrm,
  FieldOrmValueType,
  MappingTableOrm,
} from "@/database/orm/ormTypes";
import dragdropStyles from "./dragdrop.module.css";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import s3url from "@/shared/cdnHost";
import Image from "next/image";

interface MappingTableRowProps {
  mappingTable: MappingTableOrm;
  mappedIndex: number;
  mappedId: number;
  loading: boolean;
  setFieldValue: (
    field: FieldOrm,
    index: number,
    value: FieldOrmValueType,
  ) => void;
  setDirty: () => void;
  handleClick_openEditMappingDialog: (mappingRowIndex: number) => void;
  handleClick_deleteMappingRow: (mappedIndex: number) => void;
}

export default function MappingTableRow({
  mappingTable,
  mappedIndex,
  mappedId,
  loading,
  setFieldValue,
  setDirty,
  handleClick_openEditMappingDialog,
  handleClick_deleteMappingRow,
}: MappingTableRowProps) {
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

    const valueStr = Array.isArray(value)
      ? value.join(", ")
      : value instanceof Date
        ? value.toLocaleString()
        : value || "";

    return <Box sx={{ marginTop: inTable ? 0 : 3, color }}>{valueStr}</Box>;
  }

  return (
    <Draggable draggableId={mappedId.toString()} index={mappedIndex}>
      {(draggable, snapshot) => (
        <TableRow
          key={mappedId}
          className={snapshot.isDragging ? dragdropStyles.draggingListItem : ""}
          ref={draggable.innerRef}
          {...draggable.draggableProps}
        >
          <TableCell sx={{ whiteSpace: "nowrap", color: "grey" }}>
            {mappedId}
          </TableCell>
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
                  tableRowCreated={true}
                  field={mappedField}
                  index={mappedIndex}
                  inTable={true}
                  loading={loading}
                  setFieldValue={setFieldValue}
                  setDirty={setDirty}
                />
              ) : (
                renderViewField(mappedField, mappedIndex, true)
              )}
            </TableCell>
          ))}
          <TableCell sx={{ whiteSpace: "nowrap" }}>
            <IconButton aria-label="Drag Row" {...draggable.dragHandleProps}>
              <DragIndicatorIcon />
            </IconButton>
            {!mappingTable.inline && (
              <IconButton
                aria-label="edit"
                onClick={() => handleClick_openEditMappingDialog(mappedIndex)}
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
      )}
    </Draggable>
  );
}
