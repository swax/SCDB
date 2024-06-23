import { Link as MuiLink } from "@mui/material";
import NextLink from "next/link";
import { forwardRef } from "react";

type MuiLinkProps = Parameters<typeof MuiLink>[0] & { href: string };

/**
 * Get the styling of a MUI link with the prefetch functionality of Next link
 * https://stackoverflow.com/questions/56484686/how-do-i-avoid-function-components-cannot-be-given-refs-when-using-react-route
 */
const MuiNextLink = forwardRef((props: MuiLinkProps, ref: any) => {
  return <MuiLink component={NextLink} ref={ref} {...props}></MuiLink>;
});

MuiNextLink.displayName = 'MuiNextLink';

export default MuiNextLink;
