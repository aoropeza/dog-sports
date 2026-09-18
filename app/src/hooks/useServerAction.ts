"use client";

import { useState, useEffect } from "react";

/** Runs a server action on mount and whenever `args` / `extraDeps` change.
 *  Bump a counter in `extraDeps` to refetch after a mutation. */
export function useServerAction<TData, TArgs extends unknown[] = []>(
  action: (...args: TArgs) => Promise<TData>,
  args: TArgs,
  skip?: boolean,
  extraDeps: unknown[] = [],
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await action(...args);
        if (active) setData(result);
      } catch (err) {
        if (active) setError(err);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (!skip) fetchData();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...args, skip, ...extraDeps]);

  return { data, loading, error };
}
