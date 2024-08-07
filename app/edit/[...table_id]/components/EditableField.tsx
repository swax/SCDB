import { FieldCms, FieldCmsValueType } from "@/backend/cms/cmsTypes";
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
  tableRowCreated: boolean;
  field: FieldCms;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (
    field: FieldCms,
    index: number,
    value: FieldCmsValueType,
  ) => void;
  setDirty: () => void;
}

export default function EditableField({
  tableName,
  tableRowCreated,
  field,
  index,
  inTable,
  loading,
  setFieldValue,
  setDirty,
}: EditableFieldProps) {
  // Event Handlers
  function handleChange_enumField(
    field: FieldCms,
    index: number,
    value: Nullable<string>,
  ) {
    setFieldValue(field, index, value);
  }

  // Rendering
  return (
    <Box
      style={{ marginTop: inTable ? 0 : 24 }}
      role="region"
      aria-label={`${field.label} Field`}
    >
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
      {field.type === "mapping" && tableRowCreated && (
        <MappingTableEditor
          label={field.label}
          mappingTable={field.mappingTable}
          setFieldValue={setFieldValue}
          setDirty={setDirty}
          loading={loading}
        />
      )}
      {field.type === "mapping" && !tableRowCreated && (
        <TextField
          disabled
          fullWidth
          label={field.label}
          size="small"
          value={`${field.label} can be added after creating the ${tableName}`}
          variant="outlined"
        />
      )}
    </Box>
  );
}
