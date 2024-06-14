import slugify from "slugify";

export function slugifyForUrl(str: string) {
  // Remove < > characters from the string
  str = str.replace(/[<>]/g, "");

  return slugify(str, {
    replacement: "-", // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    locale: undefined, // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });
}

export function resolveTemplateVars<T>(
  templateString: string,
  mappedVar: Record<string, T>,
) {
  const pattern = new RegExp(`\\$\\{([^}]+)\\}`, "g");

  let success = true;

  const resolvedString = templateString.replace(pattern, (match, key) => {
    const value = valueFromString(mappedVar, key);
    if (!value) {
      success = false;
    }
    return value;
  });

  return success ? resolvedString : null;
}

function valueFromString(obj: any, path: string, defaultValue?: string) {
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

/**
 * If you set myArray[3] = true, and nothing else, index 1/2 are 'holes' in the array.
 * They will be sent to the server as "$undefined".
 * If you don't want that, this function will set those values to null
 */
export function fillHolesWithNullInPlace<T>(arr: Nullable<T>[]) {
  for (let i = 0; i < arr.length; i++) {
    if (!arr.hasOwnProperty(i)) {
      arr[i] = null;
    }
  }
  return arr; // Optional, for chaining or confirmation
}

export function moveElementInArray<T>(
  list: T[],
  startIndex: number,
  endIndex: number,
) {
  const newOrder = Array.from(list);
  const [removed] = newOrder.splice(startIndex, 1);
  newOrder.splice(endIndex, 0, removed);

  for (let i = 0; i < list.length; i++) {
    list[i] = newOrder[i];
  }
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/** Un-camelcase the enum, so like 'CastMember' becomes 'Cast Member' */
export function enumNameToDisplayName(enumName: string) {
  return enumName.replace(/([A-Z])/g, " $1").trim();
}

export async function fileToShortHash(file: File) {
  const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex.substring(0, 8);
}
