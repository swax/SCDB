import { EnumFieldCms, FieldCms } from "@/backend/cms/cmsTypes";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { $Enums } from "@prisma/client";
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

  return (
    <FormControl disabled={loading}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        error={!field.optional && !field.values?.[index]}
        fullWidth
        label={label}
        labelId={labelId}
        onChange={(e) => setFieldValue(field, index, e.target.value)}
        size="small"
        value={field.values?.[index] || ""}
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
