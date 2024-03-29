import {
  NumberEditField,
  TableEditField,
} from "@/backend/edit/tableConfigs/tableEditTypes";
import { useForceUpdate } from "@/frontend/hooks/useForceUpdate";
import { TextField } from "@mui/material";
import { useState } from "react";

interface NumberFieldProps {
  field: NumberEditField;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (field: TableEditField, index: number, value: number) => void;
}

export default function NumberField({
  field,
  index,
  inTable,
  loading,
  setFieldValue,
}: NumberFieldProps) {
  // Hooks
  const forceUpdate = useForceUpdate();

  // error state
  const [error, setError] = useState(false);

  // Event Handlers
  function handleChange_field(
    field: NumberEditField,
    index: number,
    value: string,
  ) {
    const numberValue = parseInt(value);
    const hasError = isNaN(numberValue);

    setError(hasError);
    setFieldValue(field, index, numberValue);

    forceUpdate();
  }

  // Rendering
  return (
    <TextField
      {...(error ? { error: true } : {})}
      disabled={loading}
      helperText={field.helperText}
      label={inTable ? "" : field.name}
      onChange={(e) => handleChange_field(field, index, e.target.value)}
      value={field.values?.[index] || ""}
      variant="standard"
    />
  );
}
