/**
 * Local in the sense that when the date is put through toISOString
 * it gives you the correct day local to the user
 */
export function toLocalIsoDate(date: Date) {
  const timezoneOffsetInMs = date.getTimezoneOffset() * 60 * 1000; // Offset in milliseconds

  // Create a new date by subtracting the timezone offset from the UTC date
  return new Date(date.getTime() - timezoneOffsetInMs);
}

/** Format the date to YYYY-MM-DD */
function toDayFormat(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function toLocalDay(date: Date) {
  const localDate = toLocalIsoDate(date);

  return toDayFormat(localDate);
}

export function shiftDayToSundayBefore(date: Date, numDays: number) {
  const shiftedDate = new Date(date);
  shiftedDate.setDate(shiftedDate.getDate() + numDays);

  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = shiftedDate.getDay();

  // Shift the date to the Sunday before
  shiftedDate.setDate(shiftedDate.getDate() - dayOfWeek);

  return toLocalDay(shiftedDate);
}
