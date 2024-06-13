import { FieldOrm, FieldOrmValueType } from "@/database/orm/ormTypes";
import { Box, MenuItem, Select, TextField } from "@mui/material";
import { $Enums } from "@prisma/client";
import MappingTableEditor from "./MappingTableEditor";
import DateField2 from "./fields/DateField2";
import ImageField from "./fields/ImageField";
import ListField from "./fields/ListField";
import LookupField from "./fields/LookupField";
import NumberField from "./fields/NumberField";
import StringField from "./fields/StringField";

interface EditableFieldProps {
  tableName: string;
  field: FieldOrm;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (
    field: FieldOrm,
    index: number,
    value: FieldOrmValueType,
  ) => void;
  setDirty: () => void;
}

export default function EditableField({
  tableName,
  field,
  index,
  inTable,
  loading,
  setFieldValue,
  setDirty,
}: EditableFieldProps) {
  // Event Handlers
  function handleChange_enumField(
    field: FieldOrm,
    index: number,
    value: Nullable<string>,
  ) {
    setFieldValue(field, index, value);
  }

  // Rendering
  return (
    <Box sx={{ marginTop: inTable ? 0 : 3 }}>
      {field.type == "string" && (
        <StringField
          field={field}
          index={index}
          inTable={inTable}
          loading={loading}
          setFieldValue={setFieldValue}
        />
      )}
      {field.type == "list" && (
        <ListField
          field={field}
          index={index}
          inTable={inTable}
          loading={loading}
          setFieldValue={setFieldValue}
        />
      )}
      {field.type == "image" && (
        <ImageField
          field={field}
          index={index}
          inTable={inTable}
          loading={loading}
          setFieldValue={setFieldValue}
          tableName={tableName}
        />
      )}
      {field.type == "number" && (
        <NumberField
          field={field}
          index={index}
          inTable={inTable}
          loading={loading}
          setFieldValue={setFieldValue}
        />
      )}
      {field.type == "date" && (
        <DateField2
          field={field}
          index={index}
          inTable={inTable}
          loading={loading}
          setFieldValue={setFieldValue}
        />
      )}
      {field.type === "enum" && (
        <Select
          error={!field.optional && !field.values?.[index]}
          fullWidth
          label={inTable ? "" : field.label}
          onChange={(e) => handleChange_enumField(field, index, e.target.value)}
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
      )}
      {field.type == "slug" && (
        <TextField
          disabled={true}
          fullWidth
          helperText={field.helperText}
          label="URL Slug"
          size="small"
          value={field.values?.[index] || `(${field.derivedFrom})`}
          variant="outlined"
        />
      )}
      {field.type === "lookup" && (
        <LookupField
          field={field}
          index={index}
          inTable={inTable}
          setFieldValue={setFieldValue}
        />
      )}
      {field.type === "mapping" && (
        <MappingTableEditor
          label={field.label}
          mappingTable={field.mappingTable}
          setFieldValue={setFieldValue}
          setDirty={setDirty}
          loading={loading}
        />
      )}
    </Box>
  );
}
