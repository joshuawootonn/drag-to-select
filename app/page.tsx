"use client";

import { PointerEvent, useState } from "react";
import clsx from "clsx";

type Point = { x: number; y: number };

const areOverlapping = (rect1: DOMRect, rect2: DOMRect) => {
  if (rect1.right < rect2.left || rect2.right < rect1.left) {
    return false;
  }

  if (rect1.bottom < rect2.top || rect2.bottom < rect1.top) {
    return false;
  }

  return true;
};

const createDomRectFromTwoPoints = (start: Point, end: Point): DOMRect => {
  const top = Math.min(start.y, end.y);
  const left = Math.min(start.x, end.x);
  const width = Math.abs(start.x - end.x);
  const height = Math.abs(start.y - end.y);

  return new DOMRect(left, top, width, height);
};

export default function Home() {
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  const [currentDragSelectedIds, setCurrentDragSelectedIds] = useState<
    Set<number>
  >(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  return (
    <div
      onPointerDown={(e) => {
        setSelectionRect(new DOMRect(e.pageX, e.pageY, 0, 0));
        setDragStartPoint({ x: e.pageX, y: e.pageY });

        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e: PointerEvent) => {
        if (selectionRect == null || dragStartPoint == null) return;

        const next = new Set<number>(e.shiftKey ? Array.from(selectedIds) : []);

        const nextSelectionRect = createDomRectFromTwoPoints(
          {
            y:
              dragStartPoint.y > e.pageY
                ? selectionRect.bottom
                : selectionRect.top,
            x:
              dragStartPoint.x > e.pageX
                ? selectionRect.right
                : selectionRect.left,
          },
          {
            x: e.pageX,
            y: e.pageY,
          },
        );

        e.currentTarget.querySelectorAll("[data-selectable]").forEach((el) => {
          const rect = el.getBoundingClientRect();

          if (
            el instanceof HTMLElement &&
            areOverlapping(selectionRect, rect) &&
            el.dataset.selectable
          ) {
            next.add(parseInt(el.dataset.selectable));
          }
        });

        setCurrentDragSelectedIds(next);
        setSelectionRect(nextSelectionRect);
      }}
      onPointerUp={(e) => {
        if (selectionRect == null) return;

        e.currentTarget.releasePointerCapture(e.pointerId);
        setSelectedIds(currentDragSelectedIds);
        setSelectionRect(null);
        setDragStartPoint(null);
      }}
      className={clsx(
        "flex gap-4 flex-wrap p-32 max-w-[1000px]",
        dragStartPoint && "select-none",
      )}
    >
      {new Array(4000).fill(0).map((_, i) => (
        <div
          data-selectable={i}
          key={i}
          className={clsx(
            "h-10 w-10 shrink-0 bg-black text-white font-bold flex justify-center items-center",
            currentDragSelectedIds.has(i) && "bg-blue-500",
          )}
        >
          {i}
        </div>
      ))}
      {selectionRect && (
        <div
          className="fixed bg-blue-500 border-2 border-blue-700 opacity-30"
          style={{
            top: selectionRect.top,
            left: selectionRect.left,
            width: selectionRect.width,
            height: selectionRect.height,
          }}
        />
      )}
    </div>
  );
}
