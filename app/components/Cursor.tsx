"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";

export type CursorProps = {
  smoothnessCoefficient?: number;
};

const EXIT_DURATION_MS = 350;
const EXIT_DISTANCE = 60;
const SNAP_DURATION_MS = 450;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type Point = { x: number; y: number };
type Size = { width: number; height: number };
type Rect = { left: number; top: number; width: number; height: number };

export default function Cursor({ smoothnessCoefficient = 0.85 }: CursorProps) {
  const trail = useRef<HTMLDivElement>(null);
  const mousePosition = useRef<Point>({ x: 0, y: 0 });
  const trailPosition = useRef<Point>({ x: 0, y: 0 });
  const trailSize = useRef<Size>({ width: 0, height: 0 });

  // Твин «прилипания» к карточке контакта: курсор уезжает в центр кнопки
  // и раздувается до её размеров, принимая форму и transform карточки.
  const snapTween = useRef<{ active: boolean; startTime: number; fromPos: Point; fromSize: Size }>({
    active: false,
    startTime: 0,
    fromPos: { x: 0, y: 0 },
    fromSize: { width: 0, height: 0 },
  });
  const snapped = useRef(false);
  const interactiveRef = useRef(false);

  // Твин выхода за пределы окна: фиксированная длительность, не зависящая
  // от того, где курсор был в момент ухода.
  const exitTween = useRef<{
    active: boolean;
    startTime: number;
    from: Point;
    to: Point;
  }>({ active: false, startTime: 0, from: { x: 0, y: 0 }, to: { x: 0, y: 0 } });

  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

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
        const button = (hoveredElement?.closest(".contact-button") as HTMLElement | null) ?? null;

        let rect: Rect | null = null;
        if (button) {
          let left = 0;
          let top = 0;
          let el: HTMLElement | null = button;
          while (el) {
            left += el.offsetLeft;
            top += el.offsetTop;
            el = el.offsetParent as HTMLElement | null;
          }
          rect = {
            left: left - window.scrollX,
            top: top - window.scrollY,
            width: button.offsetWidth,
            height: button.offsetHeight,
          };
        }

        if (rect && button) {
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          if (!snapped.current) {
            snapTween.current = {
              active: true,
              startTime: performance.now(),
              fromPos: { x: trailPosition.current.x, y: trailPosition.current.y },
              fromSize: { width: trailSize.current.width, height: trailSize.current.height },
            };
            snapped.current = true;
          }

          if (snapTween.current.active) {
            const progress = Math.min(
              1,
              (performance.now() - snapTween.current.startTime) / SNAP_DURATION_MS
            );
            const eased = easeOutCubic(progress);

            trailPosition.current.x =
              snapTween.current.fromPos.x + (centerX - snapTween.current.fromPos.x) * eased;
            trailPosition.current.y =
              snapTween.current.fromPos.y + (centerY - snapTween.current.fromPos.y) * eased;
            trailSize.current.width =
              snapTween.current.fromSize.width + (rect.width - snapTween.current.fromSize.width) * eased;
            trailSize.current.height =
              snapTween.current.fromSize.height +
              (rect.height - snapTween.current.fromSize.height) * eased;

            if (progress >= 1) snapTween.current.active = false;
          } else {
            trailPosition.current.x = centerX;
            trailPosition.current.y = centerY;
            trailSize.current.width = rect.width;
            trailSize.current.height = rect.height;
          }

          // Курсор принимает форму карточки: border-radius и transform (tilt/раскрытие)
          trail.current.style.borderRadius = getComputedStyle(button).borderRadius;
          const buttonTransform = getComputedStyle(button).transform;
          trail.current.style.transform =
            buttonTransform && buttonTransform !== "none" ? buttonTransform : "none";
        } else {
          snapped.current = false;
          snapTween.current.active = false;
          trail.current.style.transform = "";

          trailPosition.current.x =
            trailPosition.current.x * smoothnessCoefficient +
            mousePosition.current.x * (1 - smoothnessCoefficient);
          trailPosition.current.y =
            trailPosition.current.y * smoothnessCoefficient +
            mousePosition.current.y * (1 - smoothnessCoefficient);
          trailSize.current.width =
            trailSize.current.width * smoothnessCoefficient + 14 * (1 - smoothnessCoefficient);
          trailSize.current.height =
            trailSize.current.height * smoothnessCoefficient + 14 * (1 - smoothnessCoefficient);
          trail.current.style.borderRadius =
            Math.min(trailSize.current.width, trailSize.current.height) / 2 + "px";
        }

        trail.current.style.left = trailPosition.current.x + "px";
        trail.current.style.top = trailPosition.current.y + "px";
        trail.current.style.width = trailSize.current.width + "px";
        trail.current.style.height = trailSize.current.height + "px";

        const isInteractive = !!button;
        if (interactiveRef.current !== isInteractive) {
          interactiveRef.current = isInteractive;
          setActive(isInteractive);
        }
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
