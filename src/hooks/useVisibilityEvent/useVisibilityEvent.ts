import { useCallback, useEffect } from 'react';

type Options = {
  immediate?: boolean;
};

/**
 * @description
 * A React hook that listens to changes in the document's visibility state and triggers a callback.
 *
 * @param callback - A function to be called when the visibility state changes.
 * It receives the current visibility state ('visible' or 'hidden') as an argument.
 * @param options - Optional configuration for the hook.
 * @param options.immediate - If true, the callback is invoked immediately upon mounting
 * with the current visibility state.
 *
 * @example
 * function Component() {
 *   useVisibilityEvent(visibilityState => {
 *     console.log(`Document is now ${visibilityState}`);
 *   });
 *
 *   return (
 *     <div>
 *       <p>Check the console for visibility changes.</p>
 *     </div>
 *   );
 * }
 */
export function useVisibilityEvent(callback: (visibilityState: 'visible' | 'hidden') => void, options: Options = {}) {
  const handleVisibilityChange = useCallback(() => {
    callback(document.visibilityState);
  }, [callback]);

  useEffect(() => {
    if (options?.immediate ?? false) {
      handleVisibilityChange();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange, options?.immediate]);
}
