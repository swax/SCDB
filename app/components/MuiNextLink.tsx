import { Link as MuiLink } from "@mui/material";
import NextLink from "next/link";
import { forwardRef } from "react";

type MuiLinkProps = Parameters<typeof MuiLink>[0] & {
  href: string;
  prefetch?: boolean;
};

/**
 * Get the styling of a MUI link with the optional prefetch functionality of Next link
 * https://stackoverflow.com/questions/56484686/how-do-i-avoid-function-components-cannot-be-given-refs-when-using-react-route
 * 
 * Prefetch is false by default, this doesn't mean it's completely off, prefetch will still happen on hover, just not page load
 * (the docs say it prefetches on hover, but it doesn't look like that's happening in the release build)
 */
const MuiNextLink = forwardRef((props: MuiLinkProps, ref: any) => {
  return (
    <MuiLink
      component={NextLink}
      prefetch={false}
      ref={ref}
      {...props}
    ></MuiLink>
  );
});

MuiNextLink.displayName = "MuiNextLink";

export default MuiNextLink;
