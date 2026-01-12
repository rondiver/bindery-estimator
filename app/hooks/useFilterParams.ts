"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getParam = useCallback(
    (key: string, defaultValue: string = "") => {
      return searchParams.get(key) ?? defaultValue;
    },
    [searchParams]
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change (except for page changes)
      if (key !== "page") {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearParams = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const hasFilters = useCallback(() => {
    return searchParams.toString() !== "";
  }, [searchParams]);

  return {
    getParam,
    setParam,
    setParams,
    clearParams,
    hasFilters,
  };
}
