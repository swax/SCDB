import { user_role_type } from './enums';

export function getRoleRank(role?: user_role_type) {
  switch (role) {
    case user_role_type.None:
      return 0;
    case user_role_type.Editor:
      return 1;
    case user_role_type.Moderator:
      return 2;
    case user_role_type.SuperMod:
      return 3;
    case user_role_type.Admin:
      return 4;
    default:
      return -1;
  }
}

/** Can change role if user is moderator and above and users role is below theirs */
export function allowedToChangeRole(
  userRole: user_role_type,
  sessionRole: user_role_type,
) {
  return (
    getRoleRank(sessionRole) >= getRoleRank(user_role_type.Moderator) &&
    getRoleRank(sessionRole) > getRoleRank(userRole)
  );
}
