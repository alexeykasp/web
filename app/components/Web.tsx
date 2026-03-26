import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FaTelegram, FaSteam, FaTwitch, FaGithub, FaLastfm, FaSpotify } from "react-icons/fa";
import { SiNamemc } from "react-icons/si";
import Image from "next/image";

export default function Web() {
  return (
      <MainContent />
  );
}

function MainContent() {
  const contacts = [
    { href: "https://github.com/alexeykasp", title: "Github", Icon: FaGithub },
    { href: "https://t.me/alexeykasp", title: "Telegram", Icon: FaTelegram },
    { href: "https://namemc.com/profile/alexeykasp", title: "NameMC", Icon: SiNamemc },
    { href: "https://steamcommunity.com/id/alexeykasp", title: "Steam", Icon: FaSteam },
    { href: "https://twitch.tv/alexeykasp", title: "Twitch", Icon: FaTwitch },
    { href: "https://last.fm/user/alexeykasp", title: "LastFM", Icon: FaLastfm },
    { href: "https://open.spotify.com/user/31xdx6itbquf5bsnsr2mrrimhoiq", title: "Spotify", Icon: FaSpotify },
  ];

  return (
    <>
      <div className="fixed top-0 right-0 m-4 shadow-lg animate-entry">
        <a
          href="https://github.com/alexeykasp/web"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--primary-color)" }}
        >
          <FaGithub size={28} />
        </a>
      </div>


      <main className="min-h-screen p-6 flex flex-col items-center animate-entry">
        {/* Аватарка */}
        <div className="mb-8 rounded-full overflow-hidden w-36 h-36 shadow-lg animate-avatar">
          <Image src={"/avatar.png"} alt="Avatar" width={144} height={144} priority />
        </div>

        <h1
          className="text-4xl font-bold mb-2 animate-title"
          style={{ color: "var(--primary-color)" }}
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
            const Icon = item.Icon;
            return (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-button animate-contact"
                title={item.title}
                style={{ animationDelay: `${index * 0.08 + 0.12}s` }}
              >
                <span className="contact-icon"><Icon size={24} /></span>
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
