import AccountCircle from '@mui/icons-material/AccountCircle';
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Link,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function LoginButton() {
    // Hooks
    const { data: session, status } = useSession();
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);

    // Event Handlers
    function handleClick_accountMenu(event: React.MouseEvent) {
        setAnchorEl(event.currentTarget);
    }

    function handleClick_closeMenu() {
        setAnchorEl(null);
    }

    // Rendering
    if (status == 'loading') {
        return <CircularProgress aria-label="Login Progress" size={16} />;
    }

    if (status == 'unauthenticated' || !session) {
        return <Button onClick={() => void signIn('google', { prompt: 'login' })}>Login</Button>;
    }

    return (
        <Box>
            <IconButton aria-label="Account Options" onClick={handleClick_accountMenu}>
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
                    <Link color="inherit" href="/profile" underline="none">
                        My Profile
                    </Link>
                </MenuItem>
                <MenuItem onClick={() => void signOut()}>Logout</MenuItem>
            </Menu>
        </Box>
    );
}
