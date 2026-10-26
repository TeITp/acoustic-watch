# Акустична варта — WEB-програмування

Кушнір Андрій Назарович, група КН-41.
Сайт компанії «Акустична варта» — сервісу моніторингу шумового забруднення. Кожна лабораторна робота лежить в окремій папці й продовжує попередню.

**Сайт:** https://teitp.github.io/acoustic-watch/

| Папка | Робота | Опублікована сторінка |
|---|---|---|
| `lab-2/` | ЛР2 — Верстка сайту компанії згідно з інструкцією (HTML/CSS) | https://teitp.github.io/acoustic-watch/lab-2/ |
| `lab-3/` | ЛР3 — Адаптивна верстка з CSS Grid та SCSS | https://teitp.github.io/acoustic-watch/lab-3/ |
| `lab-4/` | ЛР4 — Цикли, функції, функціональні вирази. Console | https://teitp.github.io/acoustic-watch/lab-4/ |
| `lab-5/` | ЛР5 — Проєктування системи класів у JavaScript | https://teitp.github.io/acoustic-watch/lab-5/ |
| `lab-6/` | ЛР6 — Відображення та фільтрація сенсорів у DOM | https://teitp.github.io/acoustic-watch/lab-6/ |
| `lab-7/` | ЛР7 — Завантаження даних з API (MockAPI + fetch) | https://teitp.github.io/acoustic-watch/lab-7/ |
| `lab-8/` | ЛР8 — TypeScript: типізація даних сенсорів | https://teitp.github.io/acoustic-watch/lab-8/ |

Опис виконання кожної роботи — у `README.md` всередині її папки.

## Збірка SCSS (ЛР3–8) і TypeScript (ЛР8)
```bash
cd lab-3
npm install
npm run build    # scss/main.scss → css/style.css
```
Скомпільований `css/style.css` уже в репозиторії, тому GitHub Pages працює без збірки.

Для ЛР8: `cd lab-8 && npm install && npx tsc` (`src/sensors.ts` → `dist/sensors.js`). Скомпільований `dist/sensors.js` теж закомічений.

API для ЛР7–8: https://6adf52148e42963c8d5dc359.mockapi.io/api/v1/sensors
