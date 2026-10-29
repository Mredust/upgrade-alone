"use client";

import { useEffect, useRef } from "react";

function canScroll(): boolean {
  const scrollHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );
  return scrollHeight > window.innerHeight;
}

export function useInfiniteScroll(
  onLoadMore: () => void,
  hasMore: boolean,
  threshold = 200
) {
  const callbackRef = useRef(onLoadMore);
  callbackRef.current = onLoadMore;

  // 滚动监听（防抖）
  useEffect(() => {
    if (!hasMore) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        const scrollTop =
          window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        );
        if (window.innerHeight + scrollTop >= scrollHeight - threshold) {
          callbackRef.current();
        }
      }, 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, [hasMore, threshold]);

  // 内容不足一屏时自动加载，避免数据量较小时无法滚动触发加载
  useEffect(() => {
    if (!hasMore) return;
    if (!canScroll()) {
      callbackRef.current();
    }
  });
}