import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";

/**
 * Hook that listens for click on an anchor element, when that happens return true
 * In the case of a soft navigation, once the new path is set, clear the loading status
 */
export default function usePageLoading() {
  const path = usePathname();
  const currentPath = useRef(path);
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
      setPageLoading(false);
      currentPath.current = path;
    }
  }, [path]);

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
