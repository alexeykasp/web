"use client";

import { useEffect, useRef, useState } from "react";

export type CursorProps = {
  smoothnessCoefficient?: number;
};

export default function Cursor({ smoothnessCoefficient = 0.82 }: CursorProps) {
  const trail = useRef<HTMLDivElement>(null);
  const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const trailPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const trailSize = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const slidingOff = useRef(false);
  const offscreenTarget = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let currentFrame: number;

    const move = () => {
      if (!trail.current) { currentFrame = requestAnimationFrame(move); return; }

      if (slidingOff.current) {
        trailPosition.current.x += (offscreenTarget.current.x - trailPosition.current.x) * 0.25;
        trailPosition.current.y += (offscreenTarget.current.y - trailPosition.current.y) * 0.25;
        trail.current.style.left = trailPosition.current.x + "px";
        trail.current.style.top = trailPosition.current.y + "px";

        const dx = trailPosition.current.x - offscreenTarget.current.x;
        const dy = trailPosition.current.y - offscreenTarget.current.y;
        if (dx * dx + dy * dy < 4) {
          slidingOff.current = false;
          setVisible(false);
        }
      } else {
        const hoveredElement = document.elementFromPoint(
          mousePosition.current.x, mousePosition.current.y
        );
        const computedStyle = hoveredElement ? getComputedStyle(hoveredElement) : null;
        const cursorStyle = computedStyle?.cursor || "default";
        const isInteractive = cursorStyle === "pointer";

        trailPosition.current.x =
          trailPosition.current.x * smoothnessCoefficient +
          mousePosition.current.x * (1 - smoothnessCoefficient);
        trailPosition.current.y =
          trailPosition.current.y * smoothnessCoefficient +
          mousePosition.current.y * (1 - smoothnessCoefficient);

        trail.current.style.left = trailPosition.current.x + "px";
        trail.current.style.top = trailPosition.current.y + "px";

        const sizeTarget = isInteractive ? { width: 46, height: 46 } : { width: 14, height: 14 };
        trailSize.current.width =
          trailSize.current.width * smoothnessCoefficient + sizeTarget.width * (1 - smoothnessCoefficient);
        trailSize.current.height =
          trailSize.current.height * smoothnessCoefficient + sizeTarget.height * (1 - smoothnessCoefficient);
        trail.current.style.width = trailSize.current.width + "px";
        trail.current.style.height = trailSize.current.height + "px";

        setActive(isInteractive);
      }
      currentFrame = requestAnimationFrame(move);
    };
    currentFrame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(currentFrame);
  }, [smoothnessCoefficient]);

  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    // mouseleave на <html> не всплывает и надёжно срабатывает именно выход за пределы окна —
    // в отличие от mouseout+relatedTarget, который может срабатывать раньше времени
    // (например над скроллбаром) и не требует проверки порога у края.
    const windowLeaveHandler = () => {
      const { x, y } = mousePosition.current;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Находим ближайший край экрана от последней известной позиции курсора
      const distances: Record<string, number> = {
        left: x,
        right: w - x,
        top: y,
        bottom: h - y,
      };
      const nearestEdge = Object.entries(distances).sort((a, b) => a[1] - b[1])[0][0];

      let tx = x;
      let ty = y;
      if (nearestEdge === "left") tx = -60;
      else if (nearestEdge === "right") tx = w + 60;
      else if (nearestEdge === "top") ty = -60;
      else if (nearestEdge === "bottom") ty = h + 60;

      offscreenTarget.current = { x: tx, y: ty };
      slidingOff.current = true;
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.documentElement.addEventListener("mouseleave", windowLeaveHandler);
    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.documentElement.removeEventListener("mouseleave", windowLeaveHandler);
    };
  }, [visible]);

  return (
    <div
      className="custom-cursor-root fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        ref={trail}
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-colors duration-300 ease-out ${
          active ? "custom-cursor-active" : "custom-cursor-idle"
        }`}
      />
    </div>
  );
}
