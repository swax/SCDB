"use client";

import SearchIcon from "@mui/icons-material/Search";
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
import usePageLoading from "../hooks/usePageLoading";
import EditViewButton from "./EditViewButton";
import UserMenu from "./UserMenu";

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
  const pageLoading = usePageLoading();

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

  const LogoHomeLink = (
    <MuiNextLink href="/">
      <Image
        alt="Home"
        style={{ objectFit: "cover", marginTop: "4px" }}
        src="/images/logo2dark.webp"
        priority
        width={90}
        height={45}
      />
    </MuiNextLink>
  );

  return (
    <AppBar aria-label="Page Header" position="sticky">
      <Toolbar disableGutters variant="dense">
        {/* Desktop left corner logo */}
        <Box sx={{ flexGrow: 0, display: { xs: "none", sm: "block" } }}>
          {LogoHomeLink}
        </Box>

        {/* Hamburger Menu */}
        <Box sx={{ flexGrow: 1, display: { xs: "flex", sm: "none" } }}>
          <IconButton
            aria-label="Hamburger Menu"
            aria-controls="hamburger-menu"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <Image
              alt="Hamburger Menu"
              style={{ objectFit: "cover" }}
              src="/images/hamburger.webp"
              priority
              width={32}
              height={32}
            />
          </IconButton>
          <Menu
            aria-label="Hamburger Menu"
            component="nav"
            id="hamburger-menu"
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
            {/* Hamburger menu items */}
            {pages.map((page, i) => (
              <MenuItem
                key={i}
                component={MuiNextLink}
                href={`/${page.label.toLowerCase()}`}
                prefetch={false}
                tabIndex={i + 1}
              >
                <Typography
                  textAlign="center"
                  style={{
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

        {/* Main header navigation links for desktop */}
        <Box
          aria-label="primary navigation"
          component="nav"
          sx={{ flexGrow: 1, display: { xs: "none", sm: "flex" } }}
        >
          {/*
           * Set prefetch to false for header links because no data is brought down,
           * waste of a request and counted as a cache miss
           */}
          {pages.map((page, i) => (
            <Button
              component={MuiNextLink}
              href={`/${page.label.toLowerCase()}`}
              key={i}
              prefetch={false}
              style={{
                color: page.color,
                fontFamily: funFont,
                fontWeight: "bold",
                fontSize: "1.0rem",
              }}
            >
              {page.label}
            </Button>
          ))}
        </Box>

        {/* Centered logo on mobile */}
        <Box
          sx={{
            display: { xs: "block", sm: "none" },
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {LogoHomeLink}
        </Box>

        {/* Right side header icons */}
        <Stack direction="row" style={{ marginRight: 8 }}>
          <EditViewButton />
          <Tooltip title="Search The Sketch Comedy Database">
            <IconButton
              aria-label="Search The Sketch Comedy Database"
              href="https://www.sketchcomedydatabase.com"
              color="inherit"
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>
          <UserMenu />
        </Stack>
      </Toolbar>

      {pageLoading ? (
        <LinearProgress
          sx={{
            backgroundColor: dividerColor,
            height: "1px",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "whitesmoke",
            },
          }}
        />
      ) : (
        <Divider
          component={"div"}
          role=""
          style={{ backgroundColor: dividerColor, height: "1px" }}
        />
      )}
    </AppBar>
  );
}
export default ResponsiveAppBar;
