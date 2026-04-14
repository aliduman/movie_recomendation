import { useEffect, useRef } from 'react';

export function useInfiniteScroll({ enabled, onLoadMore }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [enabled, onLoadMore]);

  return sentinelRef;
}

