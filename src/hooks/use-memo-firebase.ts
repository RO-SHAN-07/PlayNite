import { useMemo, DependencyList } from 'react';

type MemoFirebase<T> = T & { __memo?: boolean };

/**
 * Custom hook to enforce memoization of Firebase queries/references.
 * It attaches a non-enumerable property `__memo` to the returned object.
 * The `useCollection` and `useDoc` hooks will check for this property's
 * existence and throw an error if it's not found, ensuring that developers
 * don't forget to wrap their queries in `useMemoFirebase`.
 *
 * @param factory A function that returns the Firebase query or reference.
 * @param deps An array of dependencies for the `useMemo` hook.
 * @returns The memoized Firebase query or reference.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);
  
  // Attach a non-enumerable `__memo` property if the memoized value is an object.
  // This acts as a marker to verify that the hook was used.
  if (typeof memoized === 'object' && memoized !== null) {
    Object.defineProperty(memoized, '__memo', {
      value: true,
      writable: false,
      enumerable: false, // Important: keeps it hidden from most object iterations
      configurable: false,
    });
  }
  
  return memoized as MemoFirebase<T>;
}
