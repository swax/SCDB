import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import DiscordIcon from "./DiscordIcon";

export default function AppFooter() {
  return (
    <Box
      style={{ display: "flex", justifyContent: "center", paddingBottom: 32 }}
    >
      <Stack direction="row">
        <Tooltip title="Discuss on Discord">
          <IconButton
            aria-label="Discord Link"
            href="https://discord.gg/UKE8gSYp"
            color="inherit"
            target="_blank"
          >
            <DiscordIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Facebook">
          <IconButton
            aria-label="Facebook Link"
            href="https://www.facebook.com/people/Sketchtvlol/61562875797683/"
            color="inherit"
            target="_blank"
          >
            <FacebookIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Follow on X/Twitter">
          <IconButton
            aria-label="X/Twitter Link"
            href="https://x.com/sketchtvlol"
            color="inherit"
            target="_blank"
          >
            <XIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
