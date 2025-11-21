// Shared enums that mirror Prisma enums for use in both client and server components
// These must be kept in sync with database/schema.prisma

export enum user_role_type {
  None = "None",
  Editor = "Editor",
  Moderator = "Moderator",
  SuperMod = "SuperMod",
  Admin = "Admin",
}

export enum review_status_type {
  NeedsReview = "NeedsReview",
  Flagged = "Flagged",
  Reviewed = "Reviewed",
}

export enum operation_type {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum gender_type {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

export enum cast_role_type {
  Cast = "Cast",
  Guest = "Guest",
  Host = "Host",
  Uncredited = "Uncredited",
}

export enum credit_role_type {
  Writer = "Writer",
  Director = "Director",
  Musician = "Musician",
  Other = "Other",
}

// Export all enums as a single object for dynamic access (similar to Prisma's $Enums)
export const $Enums = {
  user_role_type,
  review_status_type,
  operation_type,
  gender_type,
  cast_role_type,
  credit_role_type,
};
