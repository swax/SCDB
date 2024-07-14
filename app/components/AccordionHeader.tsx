import { Box, Typography } from "@mui/material";

interface AccordionHeaderProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function AccordionHeader({
  icon,
  children,
}: AccordionHeaderProps) {
  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      {icon}
      <Typography fontWeight="bold" marginLeft={1} component="h2" variant="h6">
        {children}
      </Typography>
    </Box>
  );
}
