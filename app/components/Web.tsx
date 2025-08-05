import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Github } from "lucide-react";
import { FaTelegram, FaSteam, FaTwitch } from "react-icons/fa";
import { SiNamemc } from "react-icons/si";
import Image from "next/image";

const contacts = [
  {
    name: "GitHub",
    href: "https://github.com/alexeykasp",
    icon: <Github size={18} />,
    text: "GitHub",
  },
  {
    name: "Telegram",
    href: "https://t.me/alexeykasp",
    icon: <FaTelegram size={18} />,
    text: "@alexeykasp",
  },
  {
    name: "NameMC",
    href: "https://namemc.com/profile/alexeykasp",
    icon: <SiNamemc size={18} />,
    text: "alexeykasp",
  },
  {
    name: "Steam",
    href: "https://steamcommunity.com/id/alexeykasp",
    icon: <FaSteam size={18} />,
    text: "alexeykasp",
  },
  {
    name: "Twitch",
    href: "https://twitch.tv/alexeykasp",
    icon: <FaTwitch size={18} />,
    text: "alexeykasp",
  },
];

export default function Web() {
  return (
      <MainContent />
  );
}

function MainContent() {
  return (
    <>

      <main className="min-h-screen p-6 flex flex-col items-center">
        {/* Аватарка */}
        <div className="mb-8 rounded-full overflow-hidden w-24 h-24 shadow-lg shadow-[var(--shadow-color)]">
          <Image src={"/avatar.png"} alt="Avatar" width={96} height={96} priority />
        </div>

        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: "var(--primary-color)" }}
        >
          Привет, я alexeykasp
        </h1>
        <p
          className="text-lg mb-6 max-w-xl text-center"
          style={{ color: "var(--text-color)" }}
        >
          Я увлекаюсь программированием, автоматизацией, созданием скриптов и
          изучением технологий. Добро пожаловать на мою визитку!
        </p>

        {/* Контакты */}
        <div className="flex justify-center gap-4 flex-wrap mb-16">
          {contacts.map(({ name, href, icon, text }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-button"
              title={text}
            >
              <span className="contact-icon">{icon}</span>
              <span className="contact-text">{text}</span>
            </a>
          ))}
        </div>

        {/* Навыки и проекты */}
        <section
          className="max-w-4xl w-full grid grid-cols-1 sm:grid-cols-2 gap-6 text-left"
          style={{ color: "var(--text-color)" }}
        >
          <Card
            className="bg-[var(--accent-bg)] border border-[var(--header-bg)] shadow-[0_0_10px_var(--shadow-color)]"
            style={{ color: "var(--primary-color)" }}
          >
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Навыки</h2>
              <ul className="list-disc list-inside">
                <li>Python (скрипты, автоматизация)</li>
                <li>JavaScript / TypeScript</li>
                <li>React, Next.js</li>
                <li>Работа с API, web scraping</li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className="bg-[var(--accent-bg)] border border-[var(--header-bg)] shadow-[0_0_10px_var(--shadow-color)]"
            style={{ color: "var(--primary-color)" }}
          >
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Проекты</h2>
              <ul className="list-disc list-inside">
                <li>Telegram-боты на Python</li>
                <li>Скрипты для YouTube-чата</li>
                <li>Автоматизация рутины</li>
                <li>Веб-приложения на React</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
