import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import XIcon from "@mui/icons-material/X";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import DiscordIcon from "./DiscordIcon";

export default function AppFooter() {
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: 32,
      }}
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
        <Tooltip title="View on GitHub">
          <IconButton
            aria-label="GitHub Link"
            href="https://github.com/swax/SCDB"
            color="inherit"
            target="_blank"
          >
            <GitHubIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        SketchTV.lol™ 2025
      </Typography>
    </Box>
  );
}
