import LoopIcon from "@mui/icons-material/Loop";
import { IconButton, Tooltip } from "@mui/material";
import { invalidate } from "./invalidateAction";

/** Used to break the cache when doing active development */
export default function InvalidateCacheButton() {
  // Event handlers
  async function invalidateCacheButton_click() {
    // get table/id from url
    const path = window.location.pathname;
    const parts = path.split("/");

    const table = parts[1];
    const id = parseInt(parts[2]);

    await invalidate(table, id);
    window.location.reload();
  }

  // Rendering
  // If not dev mode return nothing
  if (process.env.NODE_ENV !== "development") {
    return <></>;
  }

  return (
    <Tooltip title={`Invalidate Cache. Refetch Data`}>
      <IconButton
        aria-label="Invalidate Cache"
        aria-controls="menu-appbar"
        color="inherit"
        onClick={() => void invalidateCacheButton_click()}
      >
        <LoopIcon />
      </IconButton>
    </Tooltip>
  );
}
