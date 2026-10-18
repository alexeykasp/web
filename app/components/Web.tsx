"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";

type Contact = { href: string; title: string; svgSrc: string; size: number };

const CONTACTS: Contact[] = [
  { href: "https://stats.fm/alexeykasp", title: "stats.fm", svgSrc: "/statsfm.svg", size: 20 },
  { href: "https://github.com/alexeykasp", title: "Github", svgSrc: "/github.svg", size: 22 },
  { href: "https://t.me/alexeykasp", title: "Telegram", svgSrc: "/telegram.svg", size: 16 },
  { href: "https://steamcommunity.com/id/alexeykasp", title: "Steam", svgSrc: "/steam.svg", size: 24 },
  { href: "https://open.spotify.com/user/31xdx6itbquf5bsnsr2mrrimhoiq", title: "Spotify", svgSrc: "/spotify.svg", size: 22 },
];

const CARD_BASE_TRANSFORM =
  "perspective(800px) rotateX(0deg) rotateY(0deg) translate3d(0,0,0) scale(1)";

const CONTACT_BASE_TRANSFORM =
  "perspective(400px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)";

// Постоянные транзишены кнопки контакта (морфинг) + transform для tilt
const CONTACT_TRANSITIONS =
  "gap 0.5s cubic-bezier(0.65,0,0.35,1), " +
  "border-radius 0.5s cubic-bezier(0.65,0,0.35,1), " +
  "background-color 0.35s ease, color 0.35s ease, " +
  "box-shadow 0.35s ease, border-color 0.35s ease";
const CONTACT_TILT_FAST = CONTACT_TRANSITIONS + ", transform 0.1s ease-out";
const CONTACT_TILT_SLOW = CONTACT_TRANSITIONS + ", transform 0.4s cubic-bezier(0.16,1,0.3,1)";

export default function Web() {
  return <MainContent />;
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  // при включении reduced motion — мгновенно вернуть карточку в исходное состояние
  useEffect(() => {
    const card = cardRef.current;
    if (reducedMotion && card) {
      card.style.transition = "none";
      card.style.transform = CARD_BASE_TRANSFORM;
      card.style.willChange = "auto";
    }
  }, [reducedMotion]);

  const handleMouseEnter = () => {
    if (reducedMotion) return;
    const card = cardRef.current;
    if (!card) return;
    card.style.willChange = "transform";
    card.style.transition = "transform 0.1s ease-out";
  };

  // Без setState на каждый пиксель: rAF + прямая запись transform,
  // позиция берётся из самого свежего события мыши.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    if (frame.current) return;

    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = pointer.current.x - rect.left;
      const y = pointer.current.y - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;
      const translateX = ((x - centerX) / centerX) * 6;
      const translateY = ((y - centerY) / centerY) * 6;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0) scale(1.04)`;
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    if (!card) return;
    card.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
    card.style.transform = CARD_BASE_TRANSFORM;
    card.style.willChange = "auto";
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: CARD_BASE_TRANSFORM,
        transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
        transformStyle: "preserve-3d",
      }}
      className="hover:shadow-[0_0_22px_var(--shadow-color)] rounded-xl"
    >
      {children}
    </div>
  );
}

function TiltContactButton({ item, index }: { item: Contact; index: number }) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const [entered, setEntered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // Точная ширина текста → CSS-переменная --text-max (раскрытие кнопки без grid-анимации)
  useLayoutEffect(() => {
    const el = textRef.current;
    if (el?.parentElement) {
      el.parentElement.style.setProperty("--text-max", `${el.scrollWidth}px`);
    }
  }, []);

  const handleMouseEnter = () => {
    if (reducedMotion || !entered) return;
    const el = anchorRef.current;
    if (!el) return;
    el.style.willChange = "transform";
    el.style.transition = CONTACT_TILT_FAST;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reducedMotion || !entered) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    if (frame.current) return;

    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = anchorRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = pointer.current.x - rect.left;
      const y = pointer.current.y - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      el.style.transform = `perspective(400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px) scale(1.06)`;
    });
  };

  const handleMouseLeave = () => {
    const el = anchorRef.current;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    if (!el || !entered || reducedMotion) return;
    el.style.transition = CONTACT_TILT_SLOW;
    el.style.transform = CONTACT_BASE_TRANSFORM;
    el.style.willChange = "auto";
  };

  return (
    <a
      ref={anchorRef}
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={entered ? "contact-button" : "contact-button animate-contact"}
      title={item.title}
      onAnimationEnd={() => setEntered(true)}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        animationDelay: `${index * 0.08 + 0.6}s`,
        ...(entered ? { transition: CONTACT_TILT_SLOW } : { transition: CONTACT_TRANSITIONS }),
      }}
    >
      <span className="contact-icon">
        <Image src={item.svgSrc} alt={item.title} width={item.size} height={item.size} />
      </span>
      <span className="contact-text" ref={textRef}>
        {item.title}
      </span>
    </a>
  );
}

function MainContent() {
  return (
    <>
      <main className="flex-1 flex flex-col items-center justify-center animate-entry px-6 py-6">
        {/* Аватарка */}
        <div
          className="mb-8 rounded-full overflow-hidden w-36 h-36 shadow-lg animate-avatar"
          style={{ boxShadow: "0 0 12px rgba(217,74,114,0.25)", border: "2px solid rgba(217,74,114,0.25)" }}
        >
          <Image src="/avatar.png" alt="Avatar" width={144} height={144} priority />
        </div>

        <h1
          className="text-4xl font-bold mb-2 animate-title"
          style={{ color: "var(--primary-color)", textShadow: "0 0 8px rgba(217,74,114,0.35)" }}
        >
          Привет, я alexeykasp
        </h1>
        <p
          className="text-lg mb-6 max-w-xl text-center animate-text"
          style={{ color: "var(--text-color)" }}
        >
          Я увлекаюсь программированием, автоматизацией, созданием скриптов и
          изучением технологий.
        </p>

        {/* Контакты */}
        <div className="grid md:flex gap-4 justify-center mb-16">
          {CONTACTS.map((item, index) => (
            <TiltContactButton key={item.title} item={item} index={index} />
          ))}
        </div>

        {/* Навыки и проекты */}
        <section
          className="max-w-lg w-full gap-6 text-center animate-card"
          style={{ color: "var(--text-color)" }}
        >
          <TiltCard>
            <Card
              className="bg-[var(--accent-bg)] border border-[var(--header-bg)] shadow-[0_0_10px_var(--shadow-color)]"
              style={{ color: "var(--primary-color)", borderColor: "var(--header-bg)" }}
            >
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Навыки</h2>
                <ul className="list-disc list-inside">
                  <li>Python (скрипты, автоматизация)</li>
                  <li>Хз дальше не придумал</li>
                </ul>
              </CardContent>
            </Card>
          </TiltCard>
        </section>
      </main>
    </>
  );
}
