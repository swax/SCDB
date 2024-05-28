"use client";

import { Link, Stack, Tooltip } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { MouseEvent, useState } from "react";
import DiscordIcon from "./DiscordIcon";
import EditViewButton from "./EditViewButton";
import InvalidateCacheButton from "./InvalidateCacheButton";
import LoginButton from "./LoginButton";

const pages = ["Categories", "Characters", "People", "Shows", "Sketches"];

function ResponsiveAppBar() {
  // Hooks
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  // Event handlers
  function handleOpenNavMenu(event: MouseEvent<HTMLElement>) {
    setAnchorElNav(event.currentTarget);
  }

  function handleCloseNavMenu() {
    setAnchorElNav(null);
  }

  // Rendering
  const appName = "SketchTV.lol";

  const funFont = `"Comic Sans MS", "Comic Neue", "Chalkboard", "Segoe Print", "Kristen ITC", "Caveat", sans-serif`;

  return (
    <AppBar position="static">
      <Toolbar disableGutters variant="dense">
        <Link href="/" sx={{ flexGrow: 0 }}>
          <Image
            alt="SketchTV.lol"
            style={{ objectFit: "cover" }}
            src={`/images/logo2dark.webp`}
            width={90}
            height={45}
          />
        </Link>

        {/* Hamburger Menu */}
        <Box sx={{ flexGrow: 1, display: { xs: "flex", sm: "none" } }}>
          <IconButton
            aria-label="Account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <Image
              alt="Hamburger Menu"
              style={{ objectFit: "cover" }}
              src={`/images/hamburger.webp`}
              width={32}
              height={32}
            />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: "block", md: "none" },
            }}
          >
            {pages.map((page) => (
              <MenuItem
                key={page}
                component={Link}
                href={`/${page.toLowerCase()}`}
              >
                <Typography textAlign="center" fontFamily={funFont}>
                  {page}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
        <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "flex" } }}>
          {pages.map((page) => (
            <Button
              key={page}
              component={Link}
              href={`/${page.toLowerCase()}`}
              sx={{
                color: "white",
                fontFamily: funFont,
                fontWeight: "bold",
                fontSize: "1.0rem",
              }}
            >
              {page}
            </Button>
          ))}
        </Box>

        <Stack direction={"row"} sx={{ flexGrow: 0 }}>
          <InvalidateCacheButton />
          <EditViewButton />
          <Tooltip title={`Discuss on Discord`}>
            <IconButton
              aria-label="Discord Link"
              aria-controls="menu-appbar"
              href="https://discord.gg/"
              color="inherit"
            >
              <DiscordIcon />
            </IconButton>
          </Tooltip>
          <LoginButton />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
export default ResponsiveAppBar;
