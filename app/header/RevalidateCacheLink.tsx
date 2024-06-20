"use client";

import { getRoleRank } from "@/shared/roleUtils";
import { user_role_type } from "@prisma/client";
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

  const { enabled, table, id, slug } = useMemo(() => {
    const pathParts = path.split("/");

    // A valid cached path that can be revalidated has the from "/<table>/<id>/<slug>"
    const validPath =
      path == "/" || (pathParts.length == 4 && parseInt(pathParts[2]));

    const enabled =
      validPath &&
      session?.user &&
      getRoleRank(session.user.role) >= getRoleRank(user_role_type.Moderator);

    const [, table, id, slug] = pathParts;

    return {
      enabled,
      table,
      id: parseInt(id),
      slug,
    };
  }, [session, path]);

  // Event handlers
  async function revalidateCacheButton_click() {
    if (table && id) {
      await revalidate(table, id, slug);
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
      title={`Revalidate Cache. Moderator Only`}
    >
      Revalidate Page
    </MuiNextLink>
  );
}
