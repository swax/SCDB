import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton, Tooltip } from "@mui/material";
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

  // Should match tables in sketchDatabaseCms
  const validTables = [
    "character",
    "episode",
    "season",
    "person",
    "show",
    "sketch",
    "tag",
    "category",
    "recurring-sketch",
  ];

  if (!validTables.includes(table)) {
    return <></>;
  }

  if (editMode) {
    const viewPath = pathname.replace(/^\/edit/, "");

    return (
      <Tooltip title="View this page">
        <IconButton aria-label="View Page" href={viewPath} color="inherit">
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    );
  } else {
    const editPath = `/edit${pathname}`;

    return (
      <Tooltip title="Edit this page">
        <IconButton aria-label="Edit Page" href={editPath} color="inherit">
          <EditIcon />
        </IconButton>
      </Tooltip>
    );
  }
}
