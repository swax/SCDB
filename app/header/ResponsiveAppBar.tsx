"use client";

import { Divider, LinearProgress, Stack, Tooltip } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MouseEvent, useMemo, useState } from "react";
import MuiNextLink from "../components/MuiNextLink";
import { usePageLoadingHook } from "../hooks/pageLoadingHook";
import DiscordIcon from "./DiscordIcon";
import EditViewButton from "./EditViewButton";
import RevalidateCacheButton from "./InvalidateCacheButton";
import LoginButton from "./LoginButton";

const pages = [
  {
    label: "Categories",
    color: "#FED73E",
  },
  {
    label: "Characters",
    color: "#FF7341",
  },
  {
    label: "People",
    color: "#FF3584",
  },
  {
    label: "Shows",
    color: "#47FF66",
  },
  {
    label: "Sketches",
    color: "#2ABFFF",
  },
];

function ResponsiveAppBar() {
  // Hooks
  const pageLoading = usePageLoadingHook();

  const pathname = usePathname();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const dividerColor = useMemo(() => {
    const path = pathname.toLowerCase();

    for (const page of pages) {
      if (path.startsWith(`/${page.label.substring(0, 2).toLowerCase()}`)) {
        return page.color;
      }
    }

    return undefined;
  }, [pathname]);

  // Event handlers
  function handleOpenNavMenu(event: MouseEvent<HTMLElement>) {
    setAnchorElNav(event.currentTarget);
  }

  function handleCloseNavMenu() {
    setAnchorElNav(null);
  }

  // Rendering
  const funFont = `"Comic Sans MS", "Comic Neue", "Chalkboard", "Segoe Print", "Kristen ITC", "Caveat", sans-serif`;

  return (
    <AppBar position="sticky">
      <Toolbar disableGutters variant="dense">
        <MuiNextLink href="/" sx={{ flexGrow: 0 }}>
          <Image
            alt="SketchTV.lol"
            style={{ objectFit: "cover" }}
            src={`/images/logo2dark.webp`}
            width={90}
            height={45}
          />
        </MuiNextLink>

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
            {pages.map((page, i) => (
              <MenuItem
                key={i}
                component={"a"}
                href={`/${page.label.toLowerCase()}`}
              >
                <Typography
                  textAlign="center"
                  sx={{
                    color: page.color,
                    fontFamily: funFont,
                    fontWeight: "bold",
                    fontSize: "1.0rem",
                  }}
                >
                  {page.label}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
        <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "flex" } }}>
          {pages.map((page, i) => (
            <MuiNextLink key={i} href={`/${page.label.toLowerCase()}`}>
              <Button
                sx={{
                  color: page.color,
                  fontFamily: funFont,
                  fontWeight: "bold",
                  fontSize: "1.0rem",
                }}
              >
                {page.label}
              </Button>
            </MuiNextLink>
          ))}
        </Box>

        <Stack direction={"row"} sx={{ flexGrow: 0 }}>
          <RevalidateCacheButton />
          <EditViewButton />
          <Tooltip title={`Discuss on Discord`}>
            <IconButton
              aria-label="Discord Link"
              aria-controls="menu-appbar"
              href="https://discord.gg/UKE8gSYp"
              color="inherit"
              target="_blank"
            >
              <DiscordIcon />
            </IconButton>
          </Tooltip>
          <LoginButton />
        </Stack>
      </Toolbar>

      {pageLoading ? (
        <LinearProgress
          sx={{
            bgcolor: dividerColor,
            height: "1px",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "whitesmoke",
            },
          }}
        />
      ) : (
        <Divider sx={{ bgcolor: dividerColor, height: "1px" }} />
      )}
    </AppBar>
  );
}
export default ResponsiveAppBar;
