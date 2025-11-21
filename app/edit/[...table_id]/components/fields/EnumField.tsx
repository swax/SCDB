import { EnumFieldCms, FieldCms, isFieldEmpty } from "@/backend/cms/cmsTypes";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { $Enums } from '@/shared/enums';
import { useId } from "react";

interface EnumFieldProps {
  field: EnumFieldCms;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (field: FieldCms, index: number, value: string | null) => void;
}

export default function EnumField({
  field,
  index,
  inTable,
  loading,
  setFieldValue,
}: EnumFieldProps) {
  // Hooks
  const labelId = useId();

  // Rendering
  const label = inTable ? "" : field.label;
  const value = field.values?.[index];

  return (
    <FormControl disabled={loading} fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        error={!field.optional && isFieldEmpty(field, index)}
        label={label}
        labelId={labelId}
        onChange={(e) => setFieldValue(field, index, e.target.value)}
        size="small"
        value={value || ""}
      >
        <MenuItem value="none">
          <i>Select...</i>
        </MenuItem>
        {Object.keys(($Enums as any)[field.enum]).map((value, i) => (
          <MenuItem key={i} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
