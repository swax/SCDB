import { FieldOrm, NumberFieldOrm } from "@/database/orm/ormTypes";
import { useForceUpdate } from "@/frontend/hooks/useForceUpdate";
import { TextField } from "@mui/material";

interface NumberFieldProps {
  field: NumberFieldOrm;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (field: FieldOrm, index: number, value: number) => void;
}

export default function NumberField({
  field,
  index,
  inTable,
  loading,
  setFieldValue,
}: NumberFieldProps) {
  // Constants
  const hasError =
    !field.optional && isNaN(parseInt(`${field.values?.[index]}`));

  // Hooks
  const forceUpdate = useForceUpdate();

  // Event Handlers
  function handleChange_field(
    field: NumberFieldOrm,
    index: number,
    value: string,
  ) {
    const numberValue = parseInt(value);

    setFieldValue(field, index, numberValue);

    forceUpdate();
  }

  // Rendering
  return (
    <TextField
      disabled={loading}
      error={hasError}
      helperText={field.helperText}
      label={inTable ? "" : field.label}
      onChange={(e) => handleChange_field(field, index, e.target.value)}
      size="small"
      value={field.values?.[index] || ""}
      variant="outlined"
    />
  );
}
