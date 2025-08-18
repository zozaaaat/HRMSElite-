import { useEffect, useCallback, useRef, DependencyList } from 'react';
import { logger } from '@/lib/logger';


/**
 * Optimized useEffect hook that prevents unnecessary re-renders
 * by using useCallback for dependencies and shallow comparison
 */
export function useOptimizedEffect(
  effect: () => void | (() => void),
  dependencies: DependencyList,
  options?: {
    skipFirstRender?: boolean;
    shallowCompare?: boolean;
  }
) {
  const { skipFirstRender = false, shallowCompare = true } = options || {};
  const isFirstRender = useRef(true);
  const prevDeps = useRef<DependencyList>([]);

  // Memoize dependencies to prevent unnecessary effect runs
  const memoizedDeps = useCallback(() => dependencies, dependencies);

  useEffect(() => {
    if (skipFirstRender && isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Shallow comparison of dependencies
    if (shallowCompare) {
      const currentDeps = memoizedDeps();
      const depsChanged = currentDeps.some((dep, index) => {
        const prevDep = prevDeps.current[index];
        return dep !== prevDep;
      });

      if (!depsChanged && prevDeps.current.length > 0) {
        return;
      }

      prevDeps.current = currentDeps;
    }

    return effect();
  }, [effect, memoizedDeps, skipFirstRender, shallowCompare]);
}

/**
 * useEffect with automatic cleanup for async operations
 */
export function useAsyncEffect(
  asyncEffect: () => Promise<void | (() => void)>,
  dependencies: DependencyList
) {
  useEffect(() => {
    let isMounted = true;
    let cleanup: (() => void) | void;

    const runEffect = async () => {
      try {
        cleanup = await asyncEffect();
      } catch (error) {
        if (isMounted) {
          logger.error('Async effect error:', error);
        }
      }
    };

    runEffect();

    return () => {
      isMounted = false;
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, dependencies);
}

/**
 * useEffect that only runs when the component is mounted
 */
export function useMountEffect(effect: () => void | (() => void)) {
  useEffect(() => {
    return effect();
  }, []);
}

/**
 * useEffect that runs when the component unmounts
 */
export function useUnmountEffect(effect: () => void) {
  useEffect(() => {
    return effect;
  }, []);
} 