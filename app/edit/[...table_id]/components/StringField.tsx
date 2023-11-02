import {
  StringEditField,
  TableEditField,
} from "@/backend/edit/tableConfigs/tableEditTypes";
import { useForceUpdate } from "@/frontend/hooks/useForceUpdate";
import { TextField } from "@mui/material";

interface StringFieldProps {
  field: StringEditField;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (field: TableEditField, index: number, value: string) => void;
}

export default function StringField({
  field,
  index,
  inTable,
  loading,
  setFieldValue,
}: StringFieldProps) {
  // Hooks
  const forceUpdate = useForceUpdate();

  // Event Handlers
  function handleChange_field(
    field: StringEditField,
    index: number,
    value: string,
  ) {
    setFieldValue(field, index, value);

    forceUpdate();
  }

  // Rendering
  return (
    <TextField
      disabled={loading}
      fullWidth
      helperText={field.helperText}
      label={inTable ? "" : field.name}
      multiline={Boolean(field.multiline)}
      onChange={(e) => handleChange_field(field, index, e.target.value)}
      value={field.values?.[index] || ""}
      variant="standard"
    />
  );
}
