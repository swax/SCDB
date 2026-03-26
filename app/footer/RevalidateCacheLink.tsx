"use client";

import { getRoleRank } from "@/shared/roleUtils";
import { getSingularTableName } from "@/shared/tableNames";
import { user_role_type as UserRole } from "@/shared/enums";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import MuiNextLink from "../components/MuiNextLink";
import { revalidate, revalidateRoot } from "./revalidateAction";

/** Used to break the cache when doing active development */
export default function RevalidateCacheLink() {
  // Hooks
  const path = usePathname();
  const { data: session } = useSession();

  const { enabled, table, slug } = useMemo(() => {
    const pathParts = path.split("/");

    // A valid cached path that can be revalidated has the form "/<plural>/<slug>"
    const [, pluralTable, slug] = pathParts;
    const table =
      pathParts.length == 3 && pluralTable
        ? getSingularTableName(pluralTable)
        : undefined;

    const validPath = path == "/" || !!table;

    const enabled =
      validPath &&
      session?.user &&
      getRoleRank(session.user.role) >= getRoleRank(UserRole.Moderator);

    return {
      enabled,
      table,
      slug,
    };
  }, [session, path]);

  // Event handlers
  async function revalidateCacheButton_click() {
    if (table && slug) {
      await revalidate(table, slug);
    } else {
      await revalidateRoot();
    }

    window.location.reload();
  }

  // Rendering
  if (!enabled) {
    return <></>;
  }

  return (
    <MuiNextLink
      href={""}
      onClick={() => void revalidateCacheButton_click()}
      prefetch={false}
      title="Revalidate Cache. Moderator Only"
    >
      Revalidate Page
    </MuiNextLink>
  );
}
