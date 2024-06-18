import { Box, Typography } from "@mui/material";
import "server-only";
import RevalidateCacheLink from "../header/RevalidateCacheLink";

export default function DateGeneratedFooter({ dataDate }: { dataDate?: Date }) {
  return (
    <Box mt={6}>
      <Typography variant="caption" sx={{ fontStyle: "italic", color: "#333" }}>
        {dataDate
          ? `Data Generated: ${new Date(dataDate).toLocaleString()}`
          : `Page Generated: ${new Date().toLocaleString()}`}
        <span style={{ marginLeft: 8 }}>
          <RevalidateCacheLink />
        </span>
      </Typography>
    </Box>
  );
}
