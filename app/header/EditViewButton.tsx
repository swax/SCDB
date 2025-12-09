import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton, Tooltip } from "@mui/material";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditViewButton() {
  // Hooks
  const { status } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rendering
  if (!mounted || status != "authenticated") {
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

  const id = editMode ? pathParts[3] : pathParts[2];

  if (editMode) {
    return (
      <Tooltip title="View this page">
        <IconButton
          aria-label="View Page"
          href={`/${table}/${id}`}
          color="inherit"
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title="Edit this page">
        <IconButton
          aria-label="Edit Page"
          href={`/edit/${table}/${id}`}
          color="inherit"
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
    );
  }
}
