# DialogTrack: лендинг беты

Статический сайт беты DialogTrack. Vue 3 превращается в готовый HTML при сборке, поэтому текст виден без JavaScript. Главная и страница «спасибо» есть на восьми языках, политика конфиденциальности только на английском (`/privacy/`).

Адреса: английская версия в корне (`/`), остальные в `/de/`, `/es/`, `/fr/`, `/it/`, `/pl/`, `/pt/`, `/ru/`.

## Запуск

Нужен Node.js 22.12 или новее.

```sh
npm ci
npm run dev        # разработка, http://127.0.0.1:4182
npm run build      # собрать сайт в dist/
npm run preview    # посмотреть собранный сайт
```

## Проверки

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run check               # проверяет dist/: ссылки, переводы, метаданные, FAQ, шрифты, картинки
npm run check -- --release  # дополнительно перечисляет всё, что мешает боевой публикации
```

## Где что лежит

| Путь | Что там |
| --- | --- |
| `src/locales/<язык>.json` | Все тексты страницы и SEO-строки (`seo.title`, `seo.description`, `seo.ogTitle`, `seo.ogLine`). `en.json` — источник, остальные должны повторять его структуру. |
| `src/speech-languages.json` | 25 языков распознавания с примером субтитра. |
| `src/site.js` | Факты о сайте: языки, адрес, флаги `features.pricing`, `features.inviteTime`, `privacyDraft`. |
| `src/seo.js` | Содержимое `<head>`: canonical, hreflang, Open Graph, JSON-LD, sitemap. |
| `scripts/build.mjs` | Сборка: HTML всех страниц, sitemap, robots, 404, картинки для соцсетей. |
| `scripts/check.mjs` | Проверка собранного сайта. |
| `design-reference/` | Исходный макет страницы, с которого сверстан сайт. |

## Настройки сборки

Задаются переменными окружения перед `npm run build`.

| Переменная | Назначение |
| --- | --- |
| `SITE_URL` | Адрес сайта без пути, например `https://example.com`. По умолчанию заглушка `https://dialogtrack.example`. |
| `SITE_BASE_PATH` | Путь, под которым сайт лежит на хосте. `/` для своего домена, `/<репозиторий>/` для адреса `https://<владелец>.github.io/<репозиторий>/`. |
| `SITE_DOMAIN` | Свой домен без протокола. Когда он задан, сайт собирается для корня этого домена, в `dist/` появляется `CNAME`. |
| `SITE_LIVE` | `1` открывает сайт для поисковиков. Работает только вместе с `SITE_DOMAIN`. Без неё все страницы получают `noindex`, даже на своём домене. |
| `SITE_PRICING` | `0` скрывает блок с ценами и вопрос о цене. |
| `VITE_FORM_ENDPOINT` | Адрес обработчика заявок (JSON POST). Без него форма ничего не отправляет и честно пишет, что это предпросмотр. |
| `VITE_TURNSTILE_SITEKEY` | Публичный ключ Cloudflare Turnstile. |

Обработчик получает `site`, `lang`, `requestedAt`, `email`, `languages`, `role`, `mac`, `macos`, массив `apps`, `consent`, `website` и `token`. Он должен проверить согласие и токен Turnstile и вернуть HTTP 2xx только при успешном приёме. Для обработчика на другом домене нужен CORS для адреса сайта.

## Публикация на GitHub Pages

Сайт выкладывает workflow `.github/workflows/pages.yml` при каждом push в `main`. В настройках репозитория (Settings → Pages) источником должен быть GitHub Actions.

**Предпросмотр.** Пока переменная репозитория `SITE_DOMAIN` не задана, сайт публикуется по адресу `https://<владелец>.github.io/<репозиторий>/` с `noindex`: поисковики его не индексируют, форма не отправляет заявки.

**Свой домен.**

1. В DNS для корневого домена завести четыре A-записи на адреса GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`), для `www` — CNAME на `<владелец>.github.io`.
2. В Settings → Pages указать домен как Custom domain. Когда GitHub выпустит сертификат, включить Enforce HTTPS.
3. В Settings → Secrets and variables → Actions → Variables задать `SITE_DOMAIN` (тот же домен) и перезапустить workflow.

После этого сайт открывается на своём домене, но остаётся предпросмотром с `noindex`.

**Запуск: открыть сайт для поисковиков.**

1. Закрыть то, что перечисляет `npm run check -- --release`: подключить обработчик заявок (`VITE_FORM_ENDPOINT`, `VITE_TURNSTILE_SITEKEY`), заменить заглушки цен в текстах или выставить `SITE_PRICING=0`, заполнить и согласовать политику конфиденциальности, затем `privacyDraft: false` в `src/site.js`.
2. Задать переменную репозитория `SITE_LIVE=1`. С ней workflow не выложит сайт, пока релизная проверка не пройдёт.
3. После публикации добавить сайт в Google Search Console, Bing Webmaster Tools и Яндекс Вебмастер и отправить `sitemap.xml`.
