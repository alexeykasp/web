"use client";

import { useEffect, useRef, useState } from "react";

export type CursorProps = {
  smoothnessCoefficient?: number;
};

const EXIT_DURATION_MS = 350;
const EXIT_DISTANCE = 60;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function Cursor({ smoothnessCoefficient = 0.82 }: CursorProps) {
  const trail = useRef<HTMLDivElement>(null);
  const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const trailPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const trailSize = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  // Тween выхода за пределы окна: фиксированная длительность, не зависящая
  // от того, где курсор был в момент ухода.
  const exitTween = useRef<{
    active: boolean;
    startTime: number;
    from: { x: number; y: number };
    to: { x: number; y: number };
  }>({ active: false, startTime: 0, from: { x: 0, y: 0 }, to: { x: 0, y: 0 } });

  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  // null пока не проверили matchMedia (на сервере/до эффекта), чтобы не мигать
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  // Проверяем prefers-reduced-motion и следим за изменением в реальном времени
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // html.cursor-ready включает `cursor: none` в CSS только после монтирования —
  // до этого момента (и всегда при reduced motion) виден обычный системный курсор.
  useEffect(() => {
    if (reducedMotion === false) {
      document.documentElement.classList.add("cursor-ready");
    } else {
      document.documentElement.classList.remove("cursor-ready");
    }
    return () => {
      document.documentElement.classList.remove("cursor-ready");
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion !== false) return;
    let currentFrame: number;

    const move = () => {
      if (!trail.current) {
        currentFrame = requestAnimationFrame(move);
        return;
      }

      if (exitTween.current.active) {
        const elapsed = performance.now() - exitTween.current.startTime;
        const progress = Math.min(1, elapsed / EXIT_DURATION_MS);
        const eased = easeOutCubic(progress);

        trailPosition.current.x =
          exitTween.current.from.x + (exitTween.current.to.x - exitTween.current.from.x) * eased;
        trailPosition.current.y =
          exitTween.current.from.y + (exitTween.current.to.y - exitTween.current.from.y) * eased;

        trail.current.style.left = trailPosition.current.x + "px";
        trail.current.style.top = trailPosition.current.y + "px";

        if (progress >= 1) {
          exitTween.current.active = false;
          setVisible(false);
        }
      } else {
        const hoveredElement = document.elementFromPoint(
          mousePosition.current.x,
          mousePosition.current.y
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
  }, [smoothnessCoefficient, reducedMotion]);

  useEffect(() => {
    if (reducedMotion !== false) return;

    const mouseMoveHandler = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    // mouseleave на <html> не всплывает и надёжно срабатывает именно при выходе
    // за пределы окна — в отличие от mouseout+relatedTarget.
    const windowLeaveHandler = () => {
      const { x, y } = mousePosition.current;
      const w = window.innerWidth;
      const h = window.innerHeight;

      const distances: Record<string, number> = {
        left: x,
        right: w - x,
        top: y,
        bottom: h - y,
      };
      const nearestEdge = Object.entries(distances).sort((a, b) => a[1] - b[1])[0][0];

      let tx = x;
      let ty = y;
      if (nearestEdge === "left") tx = -EXIT_DISTANCE;
      else if (nearestEdge === "right") tx = w + EXIT_DISTANCE;
      else if (nearestEdge === "top") ty = -EXIT_DISTANCE;
      else if (nearestEdge === "bottom") ty = h + EXIT_DISTANCE;

      exitTween.current = {
        active: true,
        startTime: performance.now(),
        from: { x: trailPosition.current.x, y: trailPosition.current.y },
        to: { x: tx, y: ty },
      };
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.documentElement.addEventListener("mouseleave", windowLeaveHandler);
    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.documentElement.removeEventListener("mouseleave", windowLeaveHandler);
    };
  }, [visible, reducedMotion]);

  // При reduced motion (или пока не проверили) кастомный курсор не рендерим вовсе —
  // остаётся обычный системный курсор, без движения/наклона/трейлинга.
  if (reducedMotion !== false) return null;

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
