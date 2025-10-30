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
  return (
    <>
      <div className="fixed top-0 right-0 m-4 shadow-lg">
        <a
          href="https://github.com/alexeykasp/web"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--primary-color)" }}
        >
          <FaGithub size={28} />
        </a>
      </div>


      <main className="min-h-screen p-6 flex flex-col items-center">
        {/* Аватарка */}
        <div className="mb-8 rounded-full overflow-hidden w-36 h-36 shadow-lg">
          <Image src={"/avatar.png"} alt="Avatar" width={144} height={144} priority />
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
          изучением технологий.
        </p>

        {/* Контакты */}
        <div className="
        grid
        md:flex
        gap-4
        justify-center
        mb-16
        ">
          <a
            href="https://github.com/alexeykasp"
            target="_blank"
            rel="
            noopener 
            noreferrer
            "
            className="contact-button"
            title="Github"
          >
            <span className="contact-icon"><FaGithub size={24} /></span>
            <span className="contact-text">Github</span>
          </a>

          <a
            href="https://t.me/alexeykasp"
            target="_blank"
            rel="
            noopener 
            noreferrer
            "
            className="contact-button"
            title="Telegram"
          >
            <span className="contact-icon"><FaTelegram size={24} /></span>
            <span className="contact-text">Telegram</span>
          </a>

          <a
            href="https://namemc.com/profile/alexeykasp"
            target="_blank"
            rel="
            noopener 
            noreferrer
            "
            className="contact-button"
            title="NameMC"
          >
            <span className="contact-icon"><SiNamemc size={24} /></span>
            <span className="contact-text">NameMC</span>
          </a>

          <a
            href="https://steamcommunity.com/id/alexeykasp"
            target="_blank"
            rel="
            noopener 
            noreferrer
            "
            className="contact-button"
            title="Steam"
          >
            <span className="contact-icon"><FaSteam size={24} /></span>
            <span className="contact-text">Steam</span>
          </a>

          <a
            href="https://twitch.tv/alexeykasp"
            target="_blank"
            rel="
            noopener 
            noreferrer
            "
            className="contact-button"
            title="Twitch"
          >
            <span className="contact-icon"><FaTwitch size={24} /></span>
            <span className="contact-text">Twitch</span>
          </a>

          <a
            href="https://last.fm/user/alexeykasp"
            target="_blank"
            rel="
            noopener 
            noreferrer
            "
            className="contact-button"
            title="Last.FM"
          >
            <span className="contact-icon"><FaLastfm size={24}/></span>
            <span className="contact-text">LastFM</span>
          </a>

                    <a
            href="https://open.spotify.com/user/31xdx6itbquf5bsnsr2mrrimhoiq"
            target="_blank"
            rel="
            noopener 
            noreferrer
            "
            className="contact-button"
            title="Spotify"
          >
            <span className="contact-icon"><FaSpotify size={24}/></span>
            <span className="contact-text">Spotify</span>
          </a>
        </div>


        {/* Навыки и проекты */}
        <section
          className="
          max-w-lg 
          w-full 
          gap-6 
          text-center"
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
            style={{ color: "var(--primary-color)"}}
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
