import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** True only after client hydration — avoids useEffect+setState-in-effect for mount checks. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
