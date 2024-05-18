import { Box } from "@mui/material";
import Image from "next/image";

export default function HomePage() {
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}
    >
      <Image alt="SCDB Logo" src="/images/logo.webp" width={512} height={512} />
    </Box>
  );
}
