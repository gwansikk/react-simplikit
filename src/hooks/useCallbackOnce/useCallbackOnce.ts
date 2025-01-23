/* eslint-disable @typescript-eslint/no-explicit-any */
import { DependencyList, useEffect, useRef } from 'react';

import { usePreservedCallback } from '../usePreservedCallback/index.ts';

/**
 * @descrption
 * A React hook that ensures a callback function is executed only once, regardless of
 * how many times it's called. This is useful for one-time operations that should not
 * be repeated, even if the component re-renders.
 *
 * @param callback - The callback function to be executed once.
 * @param deps - Dependencies array that will trigger a new one-time execution when changed.
 *
 * @returns A memoized function that will only execute once until dependencies change.
 *
 * @example
 * import { useCallbackOnce } from 'reactive-kit';
 *
 * function Component() {
 *   const handleOneTimeEvent = useCallbackOnce(() => {
 *     console.log('This will only run once');
 *   }, []);
 *
 *   return <button onClick={handleOneTimeEvent}>Click me</button>;
 * }
 *
 * @example
 * // With dependencies
 * function TrackingComponent({ userId }: { userId: string }) {
 *   const trackUserVisit = useCallbackOnce(() => {
 *     analytics.trackVisit(userId);
 *   }, [userId]);
 *
 *   useEffect(() => {
 *     trackUserVisit();
 *   }, [trackUserVisit]);
 *
 *   return <div>User page</div>;
 * }
 */
export function useCallbackOnce<F extends (...args: any[]) => void>(callback: F, deps: DependencyList) {
  const hasFired = useRef(false);

  useEffect(() => {
    hasFired.current = false;
  }, deps);

  return usePreservedCallback((...args: Parameters<F>) => {
    if (hasFired.current) {
      return;
    }

    callback(...args);
    hasFired.current = true;
  });
}
