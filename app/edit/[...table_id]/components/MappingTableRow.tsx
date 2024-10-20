import {
  FieldCms,
  FieldCmsValueType,
  isFieldEmpty,
  MappingTableCms,
} from "@/backend/cms/cmsTypes";
import staticUrl from "@/shared/cdnHost";
import { getImageDimensions } from "@/shared/imgSizing";
import { Draggable } from "@hello-pangea/dnd";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, TableCell, TableRow, Tooltip } from "@mui/material";
import Image from "next/image";
import dragdropStyles from "./dragdrop.module.css";
import EditableField from "./EditableField";

interface MappingTableRowProps {
  mappingTable: MappingTableCms;
  mappedIndex: number;
  mappedId: number;
  loading: boolean;
  setFieldValue: (
    field: FieldCms,
    index: number,
    value: FieldCmsValueType,
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
  function renderViewField(field: FieldCms, index: number, inTable = false) {
    let color: string | undefined;
    let value = field.values?.[index];

    if (field.type == "lookup") {
      value = field.lookup.labelValues?.[index];
    }

    if (!field.optional && isFieldEmpty(field, index)) {
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

      const { width, height, objectPosition } = getImageDimensions(
        field.preview[0],
        50,
      );

      return (
        <>
          {cdnKey ? (
            <Image
              alt="The Associated Image"
              src={`${staticUrl}/${cdnKey}`}
              style={{ objectFit: "cover", objectPosition }}
              unoptimized={true /* Not optimized in edit mode */}
              width={width}
              height={height}
            />
          ) : (
            <></>
          )}
        </>
      );
    }

    let valueStr = "";

    if (Array.isArray(value)) {
      valueStr = value.join(", ");
    } else if (value instanceof Date) {
      valueStr = value.toLocaleString();
    } else if (value === true) {
      valueStr = "✅";
    } else {
      valueStr = value ? value.toString() : "";
    }

    return (
      <Box
        style={{ marginTop: inTable ? 0 : 24, color, whiteSpace: "pre-line" }}
      >
        {valueStr}
      </Box>
    );
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
          <TableCell style={{ whiteSpace: "nowrap", color: "grey" }}>
            {mappedId}
          </TableCell>
          {mappingTable?.fields.map((mappedField, fieldIndex) => (
            <TableCell
              key={fieldIndex}
              style={{
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
          <TableCell style={{ whiteSpace: "nowrap" }}>
            <Tooltip title="Drag to Rearrange">
              <IconButton aria-label="Drag Row" {...draggable.dragHandleProps}>
                <DragIndicatorIcon />
              </IconButton>
            </Tooltip>
            {!mappingTable.inline && (
              <Tooltip title="Edit">
                <IconButton
                  aria-label="Edit Row"
                  onClick={() => handleClick_openEditMappingDialog(mappedIndex)}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete">
              <IconButton
                aria-label="Delete Row"
                onClick={() => handleClick_deleteMappingRow(mappedIndex)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      )}
    </Draggable>
  );
}
