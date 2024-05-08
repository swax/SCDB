import { DependencyList, useRef } from "react";
import { useDebounce } from "react-use";
import { UseDebounceReturn } from "react-use/lib/useDebounce";

/** Fixes debounce so it doesn't run on initializaiton when the deps haven't even changed */
export default function useDebounce2(
  fn: () => Promise<void>,
  ms?: number,
  deps?: DependencyList,
): UseDebounceReturn {
  const firstRun = useRef(true);

  return useDebounce(
    () => {
      if (firstRun.current) {
        firstRun.current = false;
        return;
      }
      void fn();
    },
    ms,
    deps,
  );
}
