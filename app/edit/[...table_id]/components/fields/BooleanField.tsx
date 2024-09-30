import {
  BooleanFieldCms,
  FieldCms,
  isFieldEmpty,
} from "@/backend/cms/cmsTypes";
import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { useEffectOnce } from "react-use";

interface BooleanFieldProps {
  field: BooleanFieldCms;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (field: FieldCms, index: number, value: boolean) => void;
}

export default function BooleanField({
  field,
  index,
  inTable,
  loading,
  setFieldValue,
}: BooleanFieldProps) {
  // Hooks
  useEffectOnce(() => {
    if (!field.optional && isFieldEmpty(field, index)) {
      setFieldValue(field, index, false);
    }
  });

  // Rendering
  return (
    <FormControl error={!field.optional && isFieldEmpty(field, index)}>
      <FormControlLabel
        label={inTable ? "" : field.label}
        disabled={loading}
        control={
          <Checkbox
            checked={field.values?.[index] || false}
            onChange={(e) => setFieldValue(field, index, e.target.checked)}
            size="small"
          />
        }
      />
    </FormControl>
  );
}
