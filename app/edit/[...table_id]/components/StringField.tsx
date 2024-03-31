import { FieldOrm, StringFieldOrm } from "@/database/orm/ormTypes";
import { useForceUpdate } from "@/frontend/hooks/useForceUpdate";
import { TextField } from "@mui/material";

interface StringFieldProps {
  field: StringFieldOrm;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (field: FieldOrm, index: number, value: string) => void;
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
    field: StringFieldOrm,
    index: number,
    value: string,
  ) {
    setFieldValue(field, index, value);

    forceUpdate();
  }

  // Rendering
  return (
    <TextField
      disabled={loading || Boolean(field.template)}
      fullWidth
      helperText={field.helperText}
      label={inTable ? "" : field.label}
      multiline={Boolean(field.multiline)}
      onChange={(e) => handleChange_field(field, index, e.target.value)}
      value={field.values?.[index] || ""}
      variant="standard"
    />
  );
}
