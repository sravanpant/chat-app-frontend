// hooks/useScrollManager.ts

import { useEffect, useRef } from 'react';

export function useScrollManager(
  dependency: React.DependencyList,
  options: {
    behavior?: ScrollBehavior;
    threshold?: number;
  } = {}
) {
  const { behavior = 'smooth', threshold = 100 } = options;
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = element;
      shouldScrollRef.current = 
        scrollHeight - scrollTop - clientHeight < threshold;
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  useEffect(() => {
    if (shouldScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  }, [behavior, dependency]);

  return scrollRef;
}