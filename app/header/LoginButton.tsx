import { getRoleRank } from "@/shared/roleUtils";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { user_role_type } from "@prisma/client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import MuiNextLink from "../components/MuiNextLink";

export default function LoginButton() {
  // Hooks
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<Nullable<Element>>(null);

  // Event Handlers
  function handleClick_accountMenu(event: React.MouseEvent) {
    setAnchorEl(event.currentTarget);
  }

  function handleClick_closeMenu() {
    setAnchorEl(null);
  }

  // Rendering
  if (status == "loading") {
    return (
      <IconButton>
        <CircularProgress aria-label="Login Progress" size={16} />
      </IconButton>
    );
  }

  if (status == "unauthenticated" || !session) {
    return (
      <Button onClick={() => void signIn("google", { prompt: "login" })}>
        Login
      </Button>
    );
  }

  const showReviewMenuItem =
    session?.user &&
    getRoleRank(session.user.role) >= getRoleRank(user_role_type.Moderator);

  return (
    <Box>
      <IconButton
        aria-label="Account Options"
        onClick={handleClick_accountMenu}
      >
        <Tooltip title="Account Options">
          <AccountCircleIcon />
        </Tooltip>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        onClose={handleClick_closeMenu}
        open={Boolean(anchorEl)}
      >
        <MenuItem>
          <MuiNextLink
            color="inherit"
            href={`/profile/${session.user.username}`}
            underline="none"
          >
            {session.user.username}
          </MuiNextLink>
        </MenuItem>
        <MenuItem>
          <MuiNextLink color="inherit" href="/account" underline="none">
            My Account
          </MuiNextLink>
        </MenuItem>

        <Divider />
        {showReviewMenuItem && (
          <MenuItem>
            <MuiNextLink color="inherit" href="/review" underline="none">
              Review
            </MuiNextLink>
          </MenuItem>
        )}
        <MenuItem>
          <MuiNextLink color="inherit" href="/changelog" underline="none">
            Changelog
          </MuiNextLink>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => void signOut()}>Logout</MenuItem>
      </Menu>
    </Box>
  );
}
