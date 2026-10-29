# my-portfolio

Сайт-портфолио / визитка.

## Стек

- Next.js 15 (App Router, static export — `output: 'export'`)
- TypeScript
- Tailwind CSS v4

## Скрипты

| Команда             | Описание                                       |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Сервер разработки                              |
| `npm run build`     | Сборка, результат — статика в `out/`           |
| `npm run typecheck` | Проверка типов (`tsc --noEmit`)                |
| `npm run lint`      | ESLint                                         |
| `npm run format`    | Prettier                                       |
| `npm run preview`   | Локальный просмотр сборки (`serve out`)        |

## Деплой

Содержимое `out/` заливается на любой статик-хостинг. Файл `public/_headers` копируется в `out/` и задаёт заголовки безопасности (CSP, X-Frame-Options и т. д.) — хостинг должен его поддерживать (например, Netlify или Cloudflare Pages).
