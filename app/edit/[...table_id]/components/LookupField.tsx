import useDebounce2 from "@/app/hooks/useDebounce2";
import { LookupFieldOption } from "@/backend/edit/lookupService";
import { LookupFieldOrm } from "@/database/orm/ormTypes";
import { fillHolesWithNullInPlace } from "@/shared/utilities";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Autocomplete,
  Box,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { SyntheticEvent, useId, useState } from "react";
import lookupAction from "../actions/lookupAction";

interface LookupFieldProps {
  field: LookupFieldOrm;
  index: number;
  inTable: boolean;
  setFieldValue: (
    field: LookupFieldOrm,
    index: number,
    value: number | null,
  ) => void;
}

export default function LookupField({
  field,
  index,
  inTable,
  setFieldValue,
}: LookupFieldProps) {
  // Constants
  const initialValue: Nullable<LookupFieldOption> = field.values?.[index]
    ? {
        id: field.values[index] as number,
        label: field.lookup?.labelValues?.[index] ?? "(lookup init error)",
      }
    : null;

  const hasError = !field.optional && !field.values?.[index];

  // Hooks
  const [value, setValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(initialValue?.label ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [options, setOptions] = useState(
    buildOptions(initialValue ? [initialValue] : []),
  );

  const comboBoxId = "combo-box-" + useId();

  useDebounce2(
    // TODO: Not sure how to fix this warning
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async () => {
      const response = await lookupAction(inputValue, field.lookup);

      if (response.error || !response.content) {
        setError(response.error || "Unknown error");
        setLoading(false);
        return;
      }

      const results = response.content;

      if (results.length === 0) {
        results.push({
          id: 0,
          label: "No matches",
          noMatches: true,
        });
      }

      // Push the existing value to the results to avoid a warning that the current option does not exist in the list
      if (value && !results.some((r) => r.id === value.id)) {
        results.push(value);
      }

      setOptions(buildOptions(results));

      setLoading(false);
    },
    500,
    [inputValue],
  );

  // Event Handlers
  /** User input change, searching */
  function handleInputChange(event: any, value: string) {
    setInputValue(value);
    setLoading(true);
    setOptions([]);
  }

  /** Change of the actual backing value */
  function handleChange(
    event: SyntheticEvent<Element, Event>,
    value: Nullable<LookupFieldOption>,
  ) {
    if (value?.noMatches) {
      return;
    }

    if (value?.createNew) {
      const url = "/edit/" + field.lookup?.table;
      window.open(url, "_blank");
      return;
    }

    setValue(value);

    field.lookup.labelValues ||= [];
    field.lookup.labelValues[index] = value ? value.label : null;

    fillHolesWithNullInPlace(field.lookup.labelValues);

    // Important to set null as undefined isn't sent over the wire
    setFieldValue(field, index, value ? value.id : null);

    const options: LookupFieldOption[] = [];

    if (value) {
      options.push(value);
    }

    setOptions(buildOptions(options));
  }

  function handleClick_openMappingRow(option: LookupFieldOption) {
    const url = "/edit/" + field.lookup?.table + "/" + option.id;
    window.open(url, "_blank");
  }

  // Helpers
  function buildOptions(options: LookupFieldOption[]) {
    options.push({
      id: 0,
      label: "Create...",
      createNew: true,
    });

    return options;
  }

  // Rendering
  return (
    <Box>
      <Autocomplete
        componentsProps={{
          popper: {
            style: { width: "fit-content" },
            placement: "bottom-start",
          },
        }}
        disablePortal
        filterOptions={(x) => x}
        getOptionDisabled={(option) => Boolean(option.noMatches)}
        id={comboBoxId}
        inputValue={inputValue}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={loading}
        noOptionsText="No Options"
        onChange={handleChange}
        onInputChange={handleInputChange}
        options={options}
        renderInput={(params) => (
          <TextField
            {...params}
            error={hasError}
            label={inTable ? "" : field.label}
            placeholder="Type to search..."
          />
        )}
        renderOption={(props, option, state) => {
          return (
            <li {...props} key={state.index}>
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  width: "100%",
                  fontStyle: option.noMatches ? "italic" : "normal",
                }}
              >
                <Box sx={{ flex: 1 }}>{option.label}</Box>
                {!option.createNew && !option.noMatches && (
                  <>
                    <Box sx={{ width: 16 }}></Box>
                    <IconButton
                      aria-label="open"
                      onClick={() => handleClick_openMappingRow(option)}
                      size="small"
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  </>
                )}
              </Box>
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
