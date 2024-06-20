import { FieldCms, ListFieldCms } from "@/backend/cms/cmsTypes";
import { useForceUpdate } from "@/app/hooks/useForceUpdate";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";

interface ListFieldProps {
  field: ListFieldCms;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (field: FieldCms, index: number, value: string[]) => void;
}

export default function ListField({
  field,
  index,
  inTable,
  loading,
  setFieldValue,
}: ListFieldProps) {
  // Constants
  const list = field.values?.[index] || [];
  const hasError =
    !field.optional && !field.values?.[index] && !field.templates;

  // Hooks
  const forceUpdate = useForceUpdate();

  // Event Handlers
  function handleChange_field(
    field: ListFieldCms,
    index: number,
    valueIndex: number,
    value: string,
  ) {
    list[valueIndex] = value;

    setFieldValue(field, index, list);

    forceUpdate();
  }

  function handleClick_add(field: ListFieldCms) {
    list.push("");

    setFieldValue(field, index, list);

    forceUpdate();
  }

  function handleClick_delete(field: ListFieldCms, listIndex: number) {
    list.splice(listIndex, 1);

    setFieldValue(field, index, list);

    forceUpdate();
  }

  // Rendering
  return (
    <>
      {!inTable && <Typography variant="h6">{field.label}</Typography>}
      {list.map((value, listIndex) => (
        <Box sx={{ display: "flex", gap: 2, ml: 2, mt: 1 }} key={listIndex}>
          <TextField
            disabled={loading || Boolean(field.templates)}
            error={hasError}
            fullWidth
            key={listIndex}
            minRows={field.multiline ? 2 : 1}
            onChange={(e) =>
              handleChange_field(field, index, listIndex, e.target.value)
            }
            size="small"
            sx={{ flexGrow: 1 }}
            value={value}
            variant="outlined"
            helperText={
              listIndex == list.length - 1 ? field.helperText : undefined
            }
          />
          <IconButton
            aria-label="delete"
            onClick={() => handleClick_delete(field, listIndex)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button
        color={!field.optional && !list.length ? "error" : "primary"}
        disabled={loading}
        onClick={() => handleClick_add(field)}
        size="small"
        sx={{ ml: 2, mt: 2 }}
        variant="outlined"
      >
        Add
      </Button>
    </>
  );
}
