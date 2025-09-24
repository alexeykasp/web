"use client";

import React from "react";

export default function NotFound() {
  return (
    <>
      <style>{`
        :root {
          --primary-color: #8b0101;
          --bg-dark: #140000;
          --text-color: #54105a;
          --header-bg: #3a0000;
          --accent-bg: #1a0000;
          --hover-bg: #4a0000;
          --shadow-color: #ff0000;
          --tooltip-bg: #2a0000;
        }
      `}</style>

      <main
        style={{
          backgroundColor: "var(--bg-dark)",
          color: "var(--text-color)",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
          textAlign: "center",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "6rem",
            fontWeight: "bold",
            color: "var(--primary-color)",
            marginBottom: "1rem",
          }}
        >
          404
        </h1>
        <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
          Страница не найдена
        </p>
        <a
          href="/"
          style={{
            color: "#fff",
            backgroundColor: "var(--hover-bg)",
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "600",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--primary-color)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--hover-bg)")
          }
        >
          Вернуться на главную
        </a>
      </main>
    </>
  );
}
