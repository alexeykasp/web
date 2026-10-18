"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";

export type CursorProps = {
  smoothnessCoefficient?: number;
};

const EXIT_DURATION_MS = 350;
const EXIT_DISTANCE = 60;
const SPREAD_DURATION_MS = 450;
const RETURN_DURATION_MS = 260;
// «Скорость следования» (0.8/кадр при 60fps) пересчитывается в постоянную
// времени экспоненциального сглаживания — поведение не зависит от частоты монитора.
const FRAME_MS = 1000 / 60;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type Point = { x: number; y: number };
type Size = { width: number; height: number };
type Rect = { left: number; top: number; width: number; height: number };

export default function Cursor({ smoothnessCoefficient = 0.8 }: CursorProps) {
  const trail = useRef<HTMLDivElement>(null);
  const mousePosition = useRef<Point>({ x: 0, y: 0 });
  const trailPosition = useRef<Point>({ x: 0, y: 0 });
  const trailSize = useRef<Size>({ width: 0, height: 0 });
  const lastFrameTime = useRef(0);

  // Растекание по карточке: фиксированный твин из текущего положения,
  // а не лерп (лерп сходится за 2-3 кадра — выглядит как телепорт).
  const spread = useRef<{ active: boolean; startTime: number; fromPos: Point; fromSize: Size }>({
    active: false,
    startTime: 0,
    fromPos: { x: 0, y: 0 },
    fromSize: { width: 0, height: 0 },
  });
  // Возврат с карточки к мыши: тоже твин — плавный сход, без рывка.
  const returnTween = useRef<{ active: boolean; startTime: number; fromPos: Point; fromSize: Size }>({
    active: false,
    startTime: 0,
    fromPos: { x: 0, y: 0 },
    fromSize: { width: 0, height: 0 },
  });
  // Текущая карточка-магнит: смена (в т.ч. на соседнюю) всегда перезапускает
  // твин из текущего положения — никаких мгновенных прыжков между карточками.
  const magnetEl = useRef<HTMLElement | null>(null);
  const interactiveRef = useRef(false);

  // Твин выхода за пределы окна: фиксированная длительность, не зависящая
  // от того, где курсор был в момент ухода.
  const exitTween = useRef<{ active: boolean; startTime: number; from: Point; to: Point }>({
    active: false,
    startTime: 0,
    from: { x: 0, y: 0 },
    to: { x: 0, y: 0 },
  });

  // Alt+Tab / потеря фокуса: скрыть мгновенно, без улёта к краю;
  // при возврате — мгновенный спавн в позиции мыши (teleportNext).
  const hiddenByBlur = useRef(false);
  const teleportNext = useRef(false);

  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // html.cursor-ready сегодня ничего не прячет (системный курсор виден всегда),
  // но класс остаётся для reduced-motion блока в CSS.
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
    const followTau = FRAME_MS / -Math.log(smoothnessCoefficient);

    const move = () => {
      const now = performance.now();
      if (!trail.current) {
        currentFrame = requestAnimationFrame(move);
        return;
      }
      const dt = Math.min(64, Math.max(1, now - lastFrameTime.current));
      lastFrameTime.current = now;

      if (teleportNext.current) {
        // мгновенный спавн в позиции мыши: возврат фокуса / из-за края
        teleportNext.current = false;
        exitTween.current.active = false;
        returnTween.current.active = false;
        spread.current.active = false;
        magnetEl.current = null;
        trailPosition.current = { ...mousePosition.current };
        trailSize.current = { width: 14, height: 14 };
        if (interactiveRef.current) {
          interactiveRef.current = false;
          setActive(false);
        }
      }

      if (exitTween.current.active) {
        const elapsed = now - exitTween.current.startTime;
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
        const magnet = (hoveredElement?.closest(".contact-button") as HTMLElement | null) ?? null;

        // Заход на карточку, смена карточки или уход — всегда твин
        // из текущего положения точки.
        if (magnet !== magnetEl.current) {
          if (magnet) {
            returnTween.current.active = false;
            spread.current = {
              active: true,
              startTime: now,
              fromPos: { ...trailPosition.current },
              fromSize: { ...trailSize.current },
            };
          } else {
            spread.current.active = false;
            returnTween.current = {
              active: true,
              startTime: now,
              fromPos: { ...trailPosition.current },
              fromSize: { ...trailSize.current },
            };
          }
          magnetEl.current = magnet;
        }

        // getBoundingClientRect у наклонённой карточки — раздутый bbox.
        // Берём нетрансформированный layout-бокс: offsetWidth/Height + цепочка
        // offsetParent, приведённые к координатам вьюпорта.
        let rect: Rect | null = null;
        if (magnet) {
          let left = 0;
          let top = 0;
          let el: HTMLElement | null = magnet;
          while (el) {
            left += el.offsetLeft;
            top += el.offsetTop;
            el = el.offsetParent as HTMLElement | null;
          }
          rect = {
            left: left - window.scrollX,
            top: top - window.scrollY,
            width: magnet.offsetWidth,
            height: magnet.offsetHeight,
          };
        }

        if (rect && magnet) {
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + rect.height / 2;

          if (spread.current.active) {
            const progress = Math.min(1, (now - spread.current.startTime) / SPREAD_DURATION_MS);
            const eased = easeOutCubic(progress);
            trailPosition.current.x =
              spread.current.fromPos.x + (targetX - spread.current.fromPos.x) * eased;
            trailPosition.current.y =
              spread.current.fromPos.y + (targetY - spread.current.fromPos.y) * eased;
            trailSize.current.width =
              spread.current.fromSize.width + (rect.width - spread.current.fromSize.width) * eased;
            trailSize.current.height =
              spread.current.fromSize.height +
              (rect.height - spread.current.fromSize.height) * eased;
            if (progress >= 1) spread.current.active = false;
          } else {
            // уже растеклась — прилипаем к живому rect карточки
            trailPosition.current.x = targetX;
            trailPosition.current.y = targetY;
            trailSize.current.width = rect.width;
            trailSize.current.height = rect.height;
          }

          trail.current.style.borderRadius = getComputedStyle(magnet).borderRadius;
          // полностью повторяем визуальный трансформ карточки (tilt+scale+перспектива)
          const tstr = getComputedStyle(magnet).transform;
          trail.current.style.transform = tstr && tstr !== "none" ? tstr : "none";
        } else if (returnTween.current.active) {
          // плавный сход с карточки к мыши (цель ретаргетится каждый кадр)
          const progress = Math.min(1, (now - returnTween.current.startTime) / RETURN_DURATION_MS);
          const eased = easeOutCubic(progress);
          trailPosition.current.x =
            returnTween.current.fromPos.x + (mousePosition.current.x - returnTween.current.fromPos.x) * eased;
          trailPosition.current.y =
            returnTween.current.fromPos.y + (mousePosition.current.y - returnTween.current.fromPos.y) * eased;
          trailSize.current.width =
            returnTween.current.fromSize.width + (14 - returnTween.current.fromSize.width) * eased;
          trailSize.current.height =
            returnTween.current.fromSize.height + (14 - returnTween.current.fromSize.height) * eased;
          trail.current.style.transform = "";
          trail.current.style.borderRadius =
            Math.min(trailSize.current.width, trailSize.current.height) / 2 + "px";
          if (progress >= 1) returnTween.current.active = false;
        } else {
          trail.current.style.transform = "";
          // сглаживание, независимое от частоты кадров (0.8/кадр @60fps)
          const alpha = 1 - Math.exp(-dt / followTau);
          trailPosition.current.x += (mousePosition.current.x - trailPosition.current.x) * alpha;
          trailPosition.current.y += (mousePosition.current.y - trailPosition.current.y) * alpha;
          trailSize.current.width += (14 - trailSize.current.width) * alpha;
          trailSize.current.height += (14 - trailSize.current.height) * alpha;
          trail.current.style.borderRadius =
            Math.min(trailSize.current.width, trailSize.current.height) / 2 + "px";
        }

        trail.current.style.left = trailPosition.current.x + "px";
        trail.current.style.top = trailPosition.current.y + "px";
        trail.current.style.width = trailSize.current.width + "px";
        trail.current.style.height = trailSize.current.height + "px";

        const isInteractive = !!magnet;
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
      // Возврат в окно: точка появляется там, где мышь ВОШЛА (края входа),
      // а не выезжает от края, куда курсор улетал при уходе.
      // !visible покрывает медленный возврат (улёт уже завершился и скрыл точку),
      // hiddenByBlur — промежуток до перерендера после blur,
      // exitTween.active — возврат прямо во время улёта.
      if (exitTween.current.active || hiddenByBlur.current || !visible) {
        teleportNext.current = true;
        hiddenByBlur.current = false;
      }
      if (!visible) setVisible(true);
    };

    // mouseleave на <html> не всплывает и надёжно срабатывает именно при выходе
    // за пределы окна. Alt+Tab тоже может его вызвать — тогда окна уже без
    // фокуса, и улёт к краю не запускаем (скроет blur-обработчик).
    const windowLeaveHandler = () => {
      if (!document.hasFocus()) return;
      const { x, y } = mousePosition.current;
      const w = window.innerWidth;
      const h = window.innerHeight;

      const distances: Record<string, number> = { left: x, right: w - x, top: y, bottom: h - y };
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

    // Alt+Tab: просто мгновенно скрыть точку (без улёта к краю);
    // при возврате фокуса она спавнится в позиции мыши (mouseMoveHandler).
    const windowBlurHandler = () => {
      hiddenByBlur.current = true;
      exitTween.current.active = false;
      setVisible(false);
    };
    const visibilityChangeHandler = () => {
      if (document.hidden) windowBlurHandler();
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.documentElement.addEventListener("mouseleave", windowLeaveHandler);
    window.addEventListener("blur", windowBlurHandler);
    document.addEventListener("visibilitychange", visibilityChangeHandler);
    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.documentElement.removeEventListener("mouseleave", windowLeaveHandler);
      window.removeEventListener("blur", windowBlurHandler);
      document.removeEventListener("visibilitychange", visibilityChangeHandler);
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
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none ${
          active ? "custom-cursor-active" : "custom-cursor-idle"
        }`}
      />
    </div>
  );
}
