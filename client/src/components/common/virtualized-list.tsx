import { ReactNode, useRef, useEffect, useState } from 'react';

interface VirtualizedListProps<T> {
  /** The data items to render */
  items: T[];
  /** Height of the container in pixels */
  height: number;
  /** Height of each row in pixels */
  rowHeight: number;
  /** Number of items to render outside the visible area (buffer) */
  overscan?: number;
  /** Render function to create each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Optional class name for the container */
  className?: string;
  /** Optional class name for each row */
  rowClassName?: string;
}

/**
 * A virtualized list component that only renders items visible in the viewport
 * to improve performance with large lists.
 */
export function VirtualizedList<T>({
  items,
  height,
  rowHeight,
  overscan = 5,
  renderItem,
  className,
  rowClassName,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate which items should be visible
  const visibleItemsCount = Math.ceil(height / rowHeight) + overscan * 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(items.length - 1, startIndex + visibleItemsCount);

  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Update scroll position when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className || ''}`}
      style={{ height: `${height}px` }}
    >
      {/* This div sets the total scrollable height */}
      <div style={{ height: `${items.length * rowHeight}px`, position: 'relative' }}>
        {/* Render only the visible items, positioned absolutely */}
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          return (
            <div
              key={actualIndex}
              className={rowClassName}
              style={{
                position: 'absolute',
                top: `${actualIndex * rowHeight}px`,
                height: `${rowHeight}px`,
                left: 0,
                right: 0,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
