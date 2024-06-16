import { getRoleRank } from "@/shared/roleUtils";
import LoopIcon from "@mui/icons-material/Loop";
import { IconButton, Tooltip } from "@mui/material";
import { user_role_type } from "@prisma/client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { revalidate, revalidateAll } from "./revalidateAction";

/** Used to break the cache when doing active development */
export default function RevalidateCacheButton() {
  // Hooks
  const path = usePathname();
  const { data: session } = useSession();

  const { enabled, table, id } = useMemo(() => {
    const pathParts = path.split("/");

    // A valid cached path that can be revalidated has the from "/<table>/<id>/<slug>"
    const validPath =
      path == "/" || (pathParts.length == 4 && parseInt(pathParts[2]));

    const enabled =
      validPath &&
      session?.user &&
      getRoleRank(session.user.role) >= getRoleRank(user_role_type.Moderator);

    const table = validPath ? pathParts[1] : null;
    const id = validPath ? parseInt(pathParts[2]) : null;

    return {
      enabled,
      table,
      id,
    };
  }, [session, path]);

  // Event handlers
  async function revalidateCacheButton_click() {
    if (table && id) {
      await revalidate(table, id);
    } else {
      await revalidateAll();
    }

    window.location.reload();
  }

  // Rendering
  if (!enabled) {
    return <></>;
  }

  return (
    <Tooltip title={`Revalidate Cache. Moderator Only`}>
      <IconButton
        aria-label="Revalidate Cache"
        aria-controls="menu-appbar"
        color="inherit"
        onClick={() => void revalidateCacheButton_click()}
      >
        <LoopIcon />
      </IconButton>
    </Tooltip>
  );
}
