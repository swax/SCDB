import { roleRank } from "@/shared/roleUtils";
import AccountCircle from "@mui/icons-material/AccountCircle";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { user_role_type } from "@prisma/client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

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
    return <CircularProgress aria-label="Login Progress" size={16} />;
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
    roleRank(session.user.role) >= roleRank(user_role_type.Moderator);

  return (
    <Box>
      <IconButton
        aria-label="Account Options"
        onClick={handleClick_accountMenu}
      >
        <Tooltip title="Account Options">
          <AccountCircle />
        </Tooltip>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        onClose={handleClick_closeMenu}
        open={Boolean(anchorEl)}
      >
        <MenuItem>
          <Link
            color="inherit"
            href={`/profile/${session.user.username}`}
            underline="none"
          >
            {session.user.username}
          </Link>
        </MenuItem>
        <MenuItem>
          <Link color="inherit" href="/account" underline="none">
            My Account
          </Link>
        </MenuItem>

        <Divider />
        {showReviewMenuItem && (
          <MenuItem>
            <Link color="inherit" href="/review" underline="none">
              Review
            </Link>
          </MenuItem>
        )}
        <MenuItem>
          <Link color="inherit" href="/changelog" underline="none">
            Changelog
          </Link>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => void signOut()}>Logout</MenuItem>
      </Menu>
    </Box>
  );
}
