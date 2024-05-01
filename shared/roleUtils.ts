import { $Enums } from "@prisma/client";

export function roleRank(role: $Enums.user_role_type) {
  switch (role) {
    case $Enums.user_role_type.None:
      return 0;
    case $Enums.user_role_type.Editor:
      return 1;
    case $Enums.user_role_type.Moderator:
      return 2;
    case $Enums.user_role_type.SuperMod:
      return 3;
    case $Enums.user_role_type.Admin:
      return 4;
    default:
      return -1;
  }
}

/** Can change role if user is moderator and above and users role is below theirs */
export function allowedToChangeRole(
  userRole: $Enums.user_role_type,
  sessionRole: $Enums.user_role_type,
) {
  return (
    roleRank(sessionRole) >= roleRank($Enums.user_role_type.Moderator) &&
    roleRank(sessionRole) > roleRank(userRole)
  );
}

export function canEdit(userRole: $Enums.user_role_type) {
  return roleRank(userRole) >= roleRank($Enums.user_role_type.Editor);
}
