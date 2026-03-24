import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Hook that listens for click on an anchor element, when that happens return true
 * In the case of a soft navigation, once the new path is set, clear the loading status
 */
export default function usePageLoading() {
  const path = usePathname();
  const params = useSearchParams();
  const paramsStr = params.toString();

  const [pageLoading, setPageLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(path);
  const [prevParams, setPrevParams] = useState(paramsStr);

  // When path or search params change, clear the loading status (React-approved
  // "store previous render info" pattern avoids setState-in-effect)
  if (prevPath !== path || prevParams !== paramsStr) {
    setPrevPath(path);
    setPrevParams(paramsStr);
    if (pageLoading) {
      setPageLoading(false);
    }
  }

  // Event handler - must be defined before useEffect
  function handleGlobalClick(event: MouseEvent) {
    if (event.target instanceof Element) {
      const anchor = event.target.closest("a");

      // If anchor and has no target property then set to loading
      if (anchor && !anchor.target) {
        setPageLoading(true);
      }
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleGlobalClick);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  return pageLoading;
}
