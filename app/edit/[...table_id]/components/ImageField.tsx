import { FieldOrm, ImageFieldOrm } from "@/database/orm/ormTypes";
import { useForceUpdate } from "@/frontend/hooks/useForceUpdate";
import { TextField } from "@mui/material";

interface ImageFieldProps {
  field: ImageFieldOrm;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (field: FieldOrm, index: number, value: string) => void;
}

export default function ImageField({
  field,
  index,
  inTable,
  loading,
  setFieldValue,
}: ImageFieldProps) {
  // Constants
  const hasError = !field.optional && !field.values?.[index] && !field.template;

  // Hooks
  const forceUpdate = useForceUpdate();

  // Event Handlers
  function handleChange_field(
    field: ImageFieldOrm,
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
      error={hasError}
      fullWidth
      helperText={field.helperText}
      label={inTable ? "" : field.label}
      onChange={(e) => handleChange_field(field, index, e.target.value)}
      size="small"
      value={field.values?.[index] || ""}
      variant="outlined"
    />
  );
}
