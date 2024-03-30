import { DateFieldOrm, FieldOrm } from "@/backend/edit/orm/tableOrmTypes";
import { DateField, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime } from "luxon";
import { useState } from "react";

interface DateField2Props {
  field: DateFieldOrm;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (field: FieldOrm, index: number, value: Date | null) => void;
}

/** '2' because DateField is used by MUI already */
export default function DateField2({
  field,
  index,
  inTable,
  loading,
  setFieldValue,
}: DateField2Props) {
  // Hooks
  const [localValue, setLocalValue] = useState<DateTime | null>(
    getInitialFieldValue(),
  );

  // Event Handlers
  function handleChange(newValue: DateTime | null) {
    setLocalValue(newValue);

    if (newValue?.isValid) {
      setFieldValue(field, index, newValue.toJSDate());
    } else if (newValue === null) {
      setFieldValue(field, index, null);
    } else {
      // Partial date, don't set the backing field yet
    }
  }

  // Helpers
  function getInitialFieldValue() {
    const indexValue = field.values?.[index];

    if (indexValue) {
      return DateTime.fromJSDate(indexValue, {
        zone: "utc",
      });
    } else {
      return null;
    }
  }

  // Rendering
  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <DateField
        disabled={loading}
        label={inTable ? "" : field.label}
        onChange={handleChange}
        value={localValue}
      />
    </LocalizationProvider>
  );
}
