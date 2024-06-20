import { FieldCms, StringFieldCms } from "@/backend/cms/cmsTypes";
import { useForceUpdate } from "@/app/hooks/useForceUpdate";
import { TextField } from "@mui/material";

interface StringFieldProps {
  field: StringFieldCms;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (field: FieldCms, index: number, value: string) => void;
}

export default function StringField({
  field,
  index,
  inTable,
  loading,
  setFieldValue,
}: StringFieldProps) {
  // Constants
  const hasError =
    !field.optional && !field.values?.[index] && !field.templates;

  // Hooks
  const forceUpdate = useForceUpdate();

  // Event Handlers
  function handleChange_field(
    field: StringFieldCms,
    index: number,
    value: string,
  ) {
    setFieldValue(field, index, value);

    forceUpdate();
  }

  // Rendering
  const isTemplate = Boolean(field.templates);
  const placeholderValue = isTemplate ? field.templates?.join(" || ") : "";

  return (
    <TextField
      disabled={loading || isTemplate}
      error={hasError}
      fullWidth
      helperText={field.helperText}
      label={inTable ? "" : field.label}
      multiline={Boolean(field.multiline)}
      minRows={field.multiline ? 3 : undefined}
      onChange={(e) => handleChange_field(field, index, e.target.value)}
      size="small"
      value={field.values?.[index] || placeholderValue}
      variant="outlined"
    />
  );
}
