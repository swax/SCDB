import { AutocompleteLookupOption } from "@/backend/edit/lookupService";
import { TableEditField } from "@/backend/edit/tableEditConfigs";
import useDebounce2 from "@/frontend/hooks/useDebounce2";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { useId, useState } from "react";
import lookupAction from "./lookupAction";

interface AutocompleteLookupProps {
  field: TableEditField;
  index: number;
  inTable: boolean;
}

export default function AutocompleteLookup({
  field,
  index,
  inTable,
}: AutocompleteLookupProps) {
  const initialValue: AutocompleteLookupOption | null = field.values?.[index]
    ? {
        id: field.values[index] as number,
        label: field.lookup?.values?.[index] ?? "(lookup init error)",
      }
    : null;

  // Hooks
  const [value, setValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(initialValue?.label ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [options, setOptions] = useState(initialValue ? [initialValue] : []);

  const comboBoxId = "combo-box-" + useId();

  useDebounce2(
    async () => {
      try {
        const results = await lookupAction(inputValue, field.lookup!);

        // Push the existing value to the results to avoid a warning that the current option does not exist in the list
        if (value && !results.some((r) => r.id === value.id)) {
          results.push(value);
        }

        setOptions(results);
      } catch (e) {
        setError(`${e}`);
      }
      setLoading(false);
    },
    500,
    [inputValue]
  );

  // Event Handlers
  /** User input change, searching */
  function handleInputChange(event: any, value: string, reason: string) {
    setInputValue(value);
    setLoading(true);
    setOptions([]);
  }

  /** Change of the actual backing value */
  function handleChange(event: any, value: AutocompleteLookupOption | null) {
    setValue(value);

    field.values ||= [];
    field.values[index] = value ? value.id : null; // Important to set null as undefined isn't sent over the wire
    
    field.modified ||= [];
    field.modified[index] = true;

    if (value) {
      setOptions([value]);
    }
  }

  // Rendering
  return (
    <Box>
      <Autocomplete
        disablePortal
        filterOptions={(x) => x}
        id={comboBoxId}
        inputValue={inputValue}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={loading}
        noOptionsText="No Matches"
        onChange={handleChange}
        onInputChange={handleInputChange}
        options={options}
        renderInput={(params) => (
          <TextField {...params} label={inTable ? "" : field.name} />
        )}
        renderOption={(props, option, state) => {
          return (
            <li {...props} key={state.index}>
              {option.label}
            </li>
          );
        }}
        size="small"
        value={value}
      />
      {error && (
        <Typography color="error" variant="subtitle2">
          {error}
        </Typography>
      )}
    </Box>
  );
}
