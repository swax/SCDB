import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Hook that listens for click on an anchor element, when that happens return true
 * In the case of a soft navigation, once the new path is set, clear the loading status
 */
export default function usePageLoading() {
  const path = usePathname();

  // Can't use this without wrapping app header in a suspense boundary, which causes the pap header to blank out on load
  // TODO: Use the more 'approved' way to get the loading bar working instead of this hacky hook
  // Really mostly a problem on the changelog page where the loading bar won't go way
  //const params = useSearchParams();

  const currentPath = useRef(path);
  //const currentParams = useRef(paramsStr);

  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    document.addEventListener("click", handleGlobalClick);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  // When path changes, clear the loading status
  useEffect(() => {
    if (currentPath.current !== path) {
      // || currentParams.current !== paramsStr) {
      setPageLoading(false);
      currentPath.current = path;
      //currentParams.current = paramsStr;
    }
  }, [path]); //, paramsStr]);

  function handleGlobalClick(event: MouseEvent) {
    if (event.target instanceof Element) {
      const anchor = event.target.closest("a");

      if (anchor) {
        setPageLoading(true);
      }
    }
  }

  return pageLoading;
}
