"use client";

import { useEffect, useState } from "react";

interface PersistApi {
  hasHydrated: () => boolean;
  onHydrate: (listener: () => void) => () => void;
  onFinishHydration: (listener: () => void) => () => void;
}

interface PersistStore {
  persist?: PersistApi;
}

export default function usePersistHydration(store: PersistStore) {
  const [hydrated, setHydrated] = useState(() => store.persist?.hasHydrated() ?? true);

  useEffect(() => {
    const persist = store.persist;

    if (!persist) {
      setHydrated(true);
      return undefined;
    }

    const hasHydrated = persist.hasHydrated();
    setHydrated(hasHydrated);

    const unsubscribeHydrate = persist.onHydrate(() => {
      setHydrated(false);
    });
    const unsubscribeFinishHydration = persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => {
      unsubscribeHydrate();
      unsubscribeFinishHydration();
    };
  }, [store]);

  return hydrated;
}
