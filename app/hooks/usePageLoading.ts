import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Hook that listens for click on an anchor element, when that happens return true
 * In the case of a soft navigation, once the new path is set, clear the loading status
 */
export default function usePageLoading() {
  const path = usePathname();
  const params = useSearchParams();
  const paramsStr = params.toString();

  const currentPath = useRef(path);
  const currentParams = useRef(paramsStr);

  const [pageLoading, setPageLoading] = useState(false);

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

  // When path or search params change, clear the loading status
  useEffect(() => {
    if (currentPath.current !== path || currentParams.current !== paramsStr) {
      setPageLoading(false);
      currentPath.current = path;
      currentParams.current = paramsStr;
    }
  }, [path, paramsStr]);

  return pageLoading;
}
