import { useForceUpdate } from "@/app/hooks/useForceUpdate";
import { FieldCms, isFieldEmpty, ListFieldCms } from "@/backend/cms/cmsTypes";
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
    !field.optional && isFieldEmpty(field, index) && !field.templates;

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
      {!inTable && (
        <Typography component="h2" variant="h6">
          {field.label}
        </Typography>
      )}
      {list.map((value, listIndex) => (
        <Box
          style={{
            alignItems: "flex-start",
            display: "flex",
            gap: 2,
            marginLeft: 16,
            marginTop: 8,
          }}
          key={listIndex}
        >
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
            style={{ flexGrow: 1 }}
            value={value}
            variant="outlined"
            helperText={
              listIndex == list.length - 1 ? field.helperText : undefined
            }
          />
          <IconButton
            aria-label="Delete Row"
            onClick={() => handleClick_delete(field, listIndex)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button
        color={hasError ? "error" : "primary"}
        disabled={loading}
        onClick={() => handleClick_add(field)}
        size="small"
        style={{ marginLeft: 16, marginTop: 16 }}
        variant="outlined"
      >
        Add {field.label}
      </Button>
    </>
  );
}
