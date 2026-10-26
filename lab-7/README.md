# ЛР7 — Завантаження даних з публічного API (MockAPI + fetch)

Ланцюжок: **MockAPI → `fetch()` → `response.json()` → масив `sensors` → `renderSensors(sensors)` → картки**. Масиву з даними в коді більше немає.

## API
- Endpoint: `https://6adf52148e42963c8d5dc359.mockapi.io/api/v1/sensors`
- MockAPI-проєкт `acoustic-watch` має prefix `/api/v1`. Ресурс `sensors` містить поля `id`, `name`, `district`, `noiseLevel` (number), `status` (`active` / `inactive`).
- У ресурсі 6 записів із методички: Центр, Сихів, Левандівка, Підзамче, Личаків, Наукова.

## Код (`js/sensors.js`)
| Вимога | Реалізація |
|---|---|
| `const API_URL` на початку файлу | реальний endpoint, не приклад із методички |
| `async function loadSensors()` | `try/catch`. Перший `await` дає `Response`, другий — `await response.json()` (масив) |
| перевірка `response.ok` | `throw new Error(\`HTTP error: ${response.status}\`)`, бо `fetch` не кидає помилку на 404/500 |
| `renderSensors(sensors)` без `fetch` | знаходить `#sensors-list`, очищує `innerHTML`, через `forEach` створює `article.sensor-card` з назвою, районом, рівнем і статусом |
| помилка | `console.error(...)` і текст «Не вдалося завантажити дані.» у контейнері |

Також додано:
- клас `sensor-card--active` / `--inactive` (сірий «неактивний» стан);
- колір значення дБ за порогами з ЛР4–5: ≤55 зелений, ≤70 помаранчевий, >70 червоний;
- повідомлення «Завантаження даних…» до відповіді сервера.

HTML: `<section class="sensors">` → `<div id="sensors-list" class="sensors__list">`, розташовано одразу після «Поточного моніторингу».

## Перевірка
- **Реальний API:** 6 карток. У DevTools → Network видно `GET sensors` зі статусом **200**, у Console видно `Отримано сенсорів: 6`.
- **Сервер відповідає 500** (перевірено підміною відповіді в Playwright): на сторінці «Не вдалося завантажити дані.», у Console `HTTP error: 500`.
- Якщо змінити запис у MockAPI і перезавантажити сторінку, показуються оновлені дані.

## Відповіді на контрольні запитання (коротко)
1. **API** — інтерфейс, через який програма отримує дані від іншої програми чи сервера.
2. **Endpoint** — конкретна адреса ресурсу, тут `GET /api/v1/sensors`.
3. **GET** — запит на отримання даних без зміни стану на сервері.
4. **`fetch()`** повертає `Promise<Response>`. `response.ok` дорівнює true для статусів 200–299. `response.json()` знову повертає Promise, тому потрібен другий `await`.
