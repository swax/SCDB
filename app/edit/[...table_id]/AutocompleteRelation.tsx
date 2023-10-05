import { Autocomplete, TextField } from "@mui/material";
import { useState } from "react";
import { useDebounce } from "react-use";
import lookupAction from "./lookupAction";

const actorList = [
  { id: 1, label: "Aidy Bryant" },
  { id: 2, label: "Beck Bennett" },
  { id: 3, label: "Kristen Stewart" },
  { id: 4, label: "Kyle Mooney" },
];

export default function AutocompleteRelation() {
  // Hooks
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<typeof actorList>([]);

  useDebounce(
    async () => {
      const results = await lookupAction(inputValue);
      setOptions(results);
      setLoading(false);
    },
    1000,
    [inputValue]
  );

  // Event Handlers
  function handleInputChange(event: any, value: string, reason: string) {
    setInputValue(value);
    setOptions([]);
    setLoading(true);
  }

  // Rendering
  return (
    <Autocomplete
      disablePortal
      filterOptions={(x) => x}
      id="combo-box-demo"
      inputValue={inputValue}
      loading={loading}
      onInputChange={handleInputChange}
      options={options}
      renderInput={(params) => <TextField {...params} label="Actor" />}
      renderOption={(props, option, state) => {
        return (
          <li {...props} key={state.index}>
            {option.label}
          </li>
        );
      }}
      sx={{ marginTop: 2, width: 300 }}
    />
  );
}
