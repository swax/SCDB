import { user_role_type } from '@/shared/enums';
import { DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  type SessionUser = DefaultUser & {
    id: string;
    username: string;
    role: user_role_type;
  };

  interface Session {
    user: SessionUser;
  }
}
