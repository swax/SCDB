import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton } from "@mui/material";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function EditViewButton() {
  // Hooks
  const { status } = useSession();
  const pathname = usePathname();

  // Rendering
  if (status != "authenticated") {
    return <></>;
  }

  const pathParts = pathname.split("/");
  const editMode = pathname.startsWith("/edit");
  const table = editMode ? pathParts[2] : pathParts[1];
  const validTables = ["character", "person", "sketch", "shows", "tag"];

  if (!validTables.includes(table)) {
    return <></>;
  }

  if (editMode) {
    const viewPath = pathname.replace(/^\/edit/, "");

    return (
      <IconButton
        aria-label="View Page"
        aria-controls="menu-appbar"
        href={viewPath}
        color="inherit"
      >
        <VisibilityIcon />
      </IconButton>
    );
  } else {
    const editPath = `/edit${pathname}`;

    return (
      <IconButton
        aria-label="Edit Page"
        aria-controls="menu-appbar"
        href={editPath}
        color="inherit"
      >
        <EditIcon />
      </IconButton>
    );
  }
}