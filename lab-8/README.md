# ЛР8 — TypeScript: типізація даних сенсорів

Код ЛР7 переписано на TypeScript. Браузер виконує тільки скомпільований `dist/sensors.js`.

## Структура
```
index.html          <section> … <div id="sensors"></div> + <script type="module" src="./dist/sensors.js">
css/style.css
src/sensors.ts      вихідний код TypeScript
dist/sensors.js     результат `npx tsc`
package.json        devDependencies: typescript (+ sass для стилів)
tsconfig.json       target/module ES2020, strict, rootDir ./src, outDir ./dist
```

## Команди
```bash
npm install          # typescript ^5.6 (перевірено на 5.9.3)
npx tsc              # src/sensors.ts → dist/sensors.js
npx tsc --watch      # автокомпіляція під час редагування
```
Відкривати через Live Server або `python3 -m http.server`, бо скрипт підключено як `type="module"`.

## Що типізовано (`src/sensors.ts`)
- `interface Sensor { id: string; name: string; district: string; noiseLevel: number; status: "active" | "inactive"; }`. Тип `status` — union literal, тому інший рядок TypeScript не пропустить.
- `function renderSensors(sensors: Sensor[]): void`. Контейнер береться як `document.querySelector<HTMLDivElement>("#sensors")`. У `strict` результат має тип `HTMLDivElement | null`, тому перевірка `if (!container) return;` обов'язкова, без неї `tsc` видає помилку.
- `async function loadSensors(): Promise<void>` з `try/catch`, `if (!response.ok) throw new Error("Не вдалося завантажити сенсори")`, `const sensors: Sensor[] = await response.json()`.
- Окремо: `type NoiseClass = "normal" | "warning" | "critical"` і `getNoiseClass(noiseLevel: number): NoiseClass` для кольору значення дБ.
- `loadSensors();` викликається в кінці файлу.

Endpoint: `https://6adf52148e42963c8d5dc359.mockapi.io/api/v1/sensors`.

## Перевірка
- `npx tsc` у `strict` проходить без помилок, з'являється `dist/sensors.js`.
- Сторінка показує 6 карток з MockAPI, у Network видно `GET sensors 200`, у Console помилок немає.
- **Помилка 500** (перевірено підміною відповіді): «Не вдалося завантажити дані.» плюс `console.error("Помилка:", …)`.
- Що ловить компілятор: якщо в `sensors.ts` написати `sensor.noiselevel` або `status: "broken"`, `tsc` видає помилку ще до запуску в браузері. У цьому й полягає різниця з ЛР7.

## Чому `dist/` у репозиторії
GitHub Pages не компілює TypeScript, тож браузеру потрібен готовий `.js`. Тому `dist/sensors.js` закомічено разом із джерелом.
