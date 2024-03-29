import slugify from "slugify";

export function slugifyForUrl(str: string) {
  return slugify(str, {
    replacement: "-", // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    locale: undefined, // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });
}

export function resolveTemplateVars(
  templateString: string,
  allowedVarString: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mappedVar: any,
) {
  const pattern = new RegExp(`\\$\\{${allowedVarString}\\.([^}]+)\\}`, "g");

  return templateString.replace(pattern, (match, key) => {
    const value = valueFromString(mappedVar, key);
    if (value === undefined) {
      throw `resolveTemplateVars: Error, ${key} is not defined`;
    }
    return value;
  });
}

function valueFromString(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  path: string,
  defaultValue?: string,
) {
  if (!path) {
    return obj;
  }
  const keys = path.split(".");
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) {
      return defaultValue;
    }
  }
  return result;
}
