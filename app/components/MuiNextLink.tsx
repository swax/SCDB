import NextLink from "next/link";
import { Link as MuiLink } from "@mui/material";

type MuiLinkProps = Parameters<typeof MuiLink>[0] & { href: string };

export default function MuiNextLink(props: MuiLinkProps) {
  return <MuiLink component={NextLink} {...props}></MuiLink>;
}
