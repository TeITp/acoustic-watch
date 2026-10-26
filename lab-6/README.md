# ЛР6 — Відображення та фільтрація сенсорів у DOM

Продовження сторінки «Акустична варта» (база — ЛР3/ЛР4). Після «Поточного моніторингу» додано секцію **«Активні сенсори»** (`section.active-sensors#sensors`). Сторінка відкривається звичайним подвійним кліком: `js/sensors.js` підключений через `defer`, без модулів.

## Що зроблено
| Вимога методички | Де |
|---|---|
| `select#district-filter` (all + райони), `input#critical-filter`, порожній `div.sensor-list` | `index.html` |
| Масив об'єктів `{id, district, location, noiseLevel, status}` | `sensors.js`: 8 сенсорів (NS-01…NS-06 як на макеті, плюс NS-07 і NS-08 для перевірки «район + критичні») |
| `querySelector` для трьох елементів | `sensorList`, `districtFilter`, `criticalFilter` |
| `createSensorCard(sensor)`: `createElement` + `textContent`, класи `sensor-card` і `sensor-card--${status}` | ID, статус-«пігулка», район, локація, рівень шуму |
| `renderSensors(arr)`: `replaceChildren()` + `forEach` + `append` | так |
| `applyFilters()`: `filter()`, district === selected або "all", `!criticalOnly \|\| status === "critical"` | так |
| `addEventListener("change", applyFilters)` для select і checkbox | так |
| Різне оформлення normal / warning / critical | SCSS-мапа `$sensor-statuses` + `@each` генерує модифікатори; колір пігулки й значення дБ задано через CSS-змінну `--status-color` |

Свідомо **не** додано: форму, видалення, статистику, делегування подій, BOM, таймери, localStorage (так вимагає методичка). `innerHTML` у картках не використовується, тільки `textContent`. Іконки (пін, будинок, хвиля) — це CSS `mask` з SVG data-URI, тож JS-код залишається чистим.

## Перевірка (Playwright, 1280px і 390px, 0 помилок у консолі)
- Старт: усі 8 карток.
- «Галицький»: NS-01, NS-07.
- «Галицький» + «Тільки критичні»: NS-07.
- «Сихівський» + критичні: порожньо (список просто порожній, як вимагає методичка).
- «Усі райони» + критичні: NS-03, NS-06, NS-07.
- Зняти checkbox: знову всі 8.
- Горизонтального скролу немає. Сітка: 1 колонка на мобільному, 2 колонки від 768px.

## Збірка CSS
`npm i` → `npm run build` (sass `scss/main.scss` → `css/style.css`). Нові стилі лежать у `scss/components/_active-sensors.scss`.
