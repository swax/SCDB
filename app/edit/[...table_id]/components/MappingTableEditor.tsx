import {
  FieldCms,
  FieldCmsValueType,
  MappingTableCms,
} from "@/backend/cms/cmsTypes";
import { moveElementInArray } from "@/shared/utilities";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";
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
import { useId, useState } from "react";
import EditableField from "./EditableField";
import MappingTableRow from "./MappingTableRow";

interface MappingTableEditorProps {
  label: string;
  mappingTable: MappingTableCms;
  loading: boolean;
  setFieldValue: (
    field: FieldCms,
    index: number,
    value: FieldCmsValueType,
  ) => void;
  setDirty: () => void;
}

export default function MappingTableEditor({
  label,
  mappingTable,
  loading,
  setFieldValue,
  setDirty,
}: MappingTableEditorProps) {
  // Hooks
  const popupId = useId();
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [editMappingRowIndex, setEditDialogMappingRowIndex] =
    useState<number>();

  const droppableId = useId();

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

    setDirty();
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

    setDirty();
  }

  function handleDragEnd({ destination, source }: DropResult) {
    if (!destination || destination.index === source.index) {
      return;
    }

    moveElementInArray(mappingTable.ids || [], source.index, destination.index);

    // Reorder the values in each of the fields, as they match the order of the ids
    for (const mappedField of mappingTable.fields) {
      const fieldValues: FieldCmsValueType[] = mappedField.values || [];
      moveElementInArray(fieldValues, source.index, destination.index);

      const modified = mappedField.modified || [];
      moveElementInArray(modified, source.index, destination.index);

      if (mappedField.type === "lookup") {
        mappedField.lookup.labelValues ||= [];
        moveElementInArray(
          mappedField.lookup.labelValues,
          source.index,
          destination.index,
        );
      }
    }

    mappingTable.resequence = true;

    setDirty();
  }

  // Rendering
  return (
    <>
      <Typography component="h2" variant="h6">
        {label}
      </Typography>
      {Boolean(mappingTable.ids?.length) && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "grey" }}>ID</TableCell>
              {mappingTable.fields.map((mappedField, fieldIndex) => (
                <TableCell key={fieldIndex}>
                  <Box sx={{ color: "grey" }}>{mappedField.label}</Box>
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={droppableId}>
              {(droppable) => (
                <TableBody
                  ref={droppable.innerRef}
                  {...droppable.droppableProps}
                >
                  {mappingTable.ids?.map((mappedId, mappedIndex) => (
                    <MappingTableRow
                      key={mappedId}
                      mappedId={mappedId}
                      mappedIndex={mappedIndex}
                      mappingTable={mappingTable}
                      loading={loading}
                      setFieldValue={setFieldValue}
                      setDirty={setDirty}
                      handleClick_openEditMappingDialog={
                        handleClick_openEditMappingDialog
                      }
                      handleClick_deleteMappingRow={
                        handleClick_deleteMappingRow
                      }
                    />
                  ))}
                  {droppable.placeholder}
                </TableBody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      )}
      <Button
        aria-controls={`mapping-row-dialog-${popupId}`}
        aria-haspopup="true"
        disabled={loading}
        onClick={() => handleClick_addMappingRow()}
        size="small"
        sx={{ marginLeft: 2, marginTop: 2 }}
        variant="outlined"
      >
        Add {label}
      </Button>

      {/* Edit mappped field dialog */}
      <Dialog
        id={`mapping-row-dialog-${popupId}`}
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
                tableRowCreated={true}
                field={field}
                index={editMappingRowIndex!}
                inTable={false}
                loading={loading}
                setFieldValue={setFieldValue}
                setDirty={setDirty}
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
