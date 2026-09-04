import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

const ESTIMATED_ROW_HEIGHT = 86;

interface UseTaskListVirtualizerParams {
  itemCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}

/** 가상 스크롤 목록의 마지막 행(무한 스크롤 트리거)이 보이면 다음 페이지를 불러옴 */
export function useTaskListVirtualizer({
  itemCount,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: UseTaskListVirtualizerParams) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // 다음 페이지가 있으면 무한 스크롤 트리거용 가상 행을 하나 더 추가
  const rowCount = hasNextPage ? itemCount + 1 : itemCount;

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 6,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastVirtualItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastVirtualItem) return;
    if (lastVirtualItem.index >= itemCount - 1 && hasNextPage && !isFetchingNextPage) {
      onFetchNextPage();
    }
  }, [lastVirtualItem?.index, hasNextPage, isFetchingNextPage, itemCount]);

  return { scrollAreaRef, rowVirtualizer, virtualItems };
}
