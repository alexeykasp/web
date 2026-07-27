import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function Web() {
  return (
      <MainContent />
  );
}

function MainContent() {
  const contacts = [
    { href: "https://stats.fm/alexeykasp", title: "stats.fm", svgSrc: "/statsfm.svg", size: 20 },
    { href: "https://github.com/alexeykasp", title: "Github", svgSrc: "/github.svg", size: 22 },
    { href: "https://t.me/alexeykasp", title: "Telegram", svgSrc: "/telegram.svg", size: 16 },
    { href: "https://steamcommunity.com/id/alexeykasp", title: "Steam", svgSrc: "/steam.svg", size: 24 },
    { href: "https://open.spotify.com/user/31xdx6itbquf5bsnsr2mrrimhoiq", title: "Spotify", svgSrc: "/spotify.svg", size: 22 },
  ];

  return (
    <>
      <main className="flex-1 flex flex-col items-center justify-center animate-entry px-6 py-6">
        {/* Аватарка */}
        <div className="mb-8 rounded-full overflow-hidden w-36 h-36 shadow-lg animate-avatar" style={{ boxShadow: "0 0 12px rgba(217,74,114,0.25)", border: "2px solid rgba(217,74,114,0.25)" }}>
          <Image src={"/avatar.png"} alt="Avatar" width={144} height={144} priority />
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
          {contacts.map((item, index) => {
            return (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-button animate-contact"
                title={item.title}
                style={{ animationDelay: `${index * 0.08 + 0.6}s` }}
              >
                <span className="contact-icon">
                  <Image src={item.svgSrc} alt={item.title} width={item.size} height={item.size} />
                </span>
                <span className="contact-text">{item.title}</span>
              </a>
            );
          })}
        </div>


        {/* Навыки и проекты */}
        <section
          className="max-w-lg w-full gap-6 text-center animate-card"
          style={{ color: "var(--text-color)" }}>

          <Card
            className="
            bg-[var(--accent-bg)]
            border border-[var(--header-bg)]
            shadow-[0_0_10px_var(--shadow-color)]
            transform
            transition-[transform, shadow] duration-300
            hover:scale-110
            hover:shadow-[0_0_20px_var(--shadow-color)]
            "
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
        </section>
      </main>
    </>
  );
}
