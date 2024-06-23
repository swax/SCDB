import { getRoleRank } from "@/shared/roleUtils";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import {
  Box,
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

export default function UserMenu() {
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
      <IconButton aria-label="Getting login status">
        <CircularProgress size={16} />
      </IconButton>
    );
  }

  if (status == "unauthenticated" || !session) {
    return (
      <Tooltip title="Login with Google">
        <IconButton
          aria-label="Login with Google"
          onClick={() => void signIn("google", { prompt: "login" })}
        >
          <LoginIcon />
        </IconButton>
      </Tooltip>
    );
  }

  const showReviewMenuItem =
    session?.user &&
    getRoleRank(session.user.role) >= getRoleRank(user_role_type.Moderator);

  return (
    <Box>
      <IconButton
        aria-label="User Menu"
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleClick_accountMenu}
      >
        <Tooltip title="User Menu">
          <AccountCircleIcon />
        </Tooltip>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        keepMounted
        onClose={handleClick_closeMenu}
        open={Boolean(anchorEl)}
      >
        <MenuItem component={"a"} href={`/profile/${session.user.username}`}>
          {session.user.username}
        </MenuItem>
        <MenuItem component={"a"} href={"/account"}>
          My Account
        </MenuItem>

        <Divider />
        {showReviewMenuItem && (
          <MenuItem component={"a"} href={"/review"}>
            Review
          </MenuItem>
        )}
        <MenuItem component={"a"} href={"/changelog"}>
          Changelog
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => void signOut()}>Logout</MenuItem>
      </Menu>
    </Box>
  );
}
