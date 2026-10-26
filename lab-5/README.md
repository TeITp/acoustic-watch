# ЛР5 — Проєктування системи класів у JavaScript

Запуск через сервер (Live Server / `python3 -m http.server`), бо `app.js` — ES-модуль.

## Структура
```
js/
├── models/
│   ├── noiseLimits.js        NOISE_LIMITS {55, 70}, NOISE_RANGE {0, 200} — єдине місце з числами
│   ├── NoiseMeasurement.js   value, measuredAt; isValid(), toString()
│   ├── NoiseSensor.js        стан + getStatus(), updateNoiseLevel(), addMeasurement(); static isValidNoiseLevel(), fromObject()
│   └── MobileNoiseSensor.js  extends NoiseSensor: batteryLevel, needsCharging(), relocate()
├── services/
│   └── MonitoringSystem.js   sensors[]; addSensor, findSensorById, getSensorsByDistrict, getCriticalSensors, getAverageNoiseLevel …
├── app.js                    дані → екземпляри → система; renderSensorCard(); події
└── monitoring.js             (з ЛР4, залишено)
```

## Таблиця відповідальностей
| Клас | Стан | Поведінка | Чого НЕ робить |
|---|---|---|---|
| NoiseSensor | id, district, location, noiseLevel, measurements | статус, оновлення рівня, нове вимірювання | не шукає серед інших датчиків, не будує HTML |
| NoiseMeasurement | value, measuredAt | валідність, форматування | не змінює датчик |
| MonitoringSystem | sensors | додавання, пошук, фільтрація, середнє | не класифікує шум (питає `sensor.getStatus()`), не торкається DOM |
| MobileNoiseSensor | + batteryLevel | зарядка, переміщення | — |

**Композиція:** `MonitoringSystem → NoiseSensor[]`, `NoiseSensor → NoiseMeasurement[]`.
**Наслідування:** «мобільний датчик *є різновидом* датчика» — речення має сенс, тому `extends` виправдане. «Система *є різновидом* датчика» — ні, тому там композиція.

## Рішення
- Дубль id → `Error`; `findSensorById` неіснуючого → `null`; `getAverageNoiseLevel()` порожньої системи → `null`.
- `fromObject` + `map`: фабрика перевіряє поля до виклику `new`, тому некоректний plain object не стане «напівсенсором».
- Середнє — через `reduce` (одна агрегація в один прохід).
- `renderSensorCard` — функція шару представлення, CSS-клас = `sensor.getStatus()`, чисел 55/70 у DOM-коді немає.

## Консоль (контроль)
NS-01 → warning, NS-02 / NS-03 → critical, середнє 71.67 dB. Експерименти з prototype згорнуто в групу «ЛР5 · Експерименти…»:
`getStatus === getStatus → true`, `hasOwn(noiseLevel) → true`, `hasOwn(getStatus) → false`, втрата `this` при `const fn = sensor.getStatus; fn()` → `TypeError`.
Для ручних перевірок у Console доступний `aw` (`aw.system.getCriticalSensors()` тощо).

## На сторінці (секція «Мережа датчиків»)
Підсумок, фільтр за районом і «лише критичні», картки з класами `normal / warning / critical`, форма «Додати вимірювання» — після запису змінюється `noiseLevel`, статус і картка перемальовується.

## Що було до рефакторингу (п. 19.1)
У ЛР4 логіка — це окремі функції над масивом чисел: `isValidLevel`, класифікація (`classifyLevel`), середнє (`calculateAverage`), пошук критичних. Тепер:
- перевірка значення → `NoiseSensor.isValidNoiseLevel()` (static);
- класифікація → `sensor.getStatus()` + `NOISE_LIMITS`;
- середнє → `system.getAverageNoiseLevel()`;
- вибірка критичних → `system.getCriticalSensors()`.

## Схема зв'язків
```
MonitoringSystem ──has──▶ NoiseSensor[] ──has──▶ NoiseMeasurement[]
                                ▲
                                │ extends
                         MobileNoiseSensor
NOISE_LIMITS ◀── uses ── NoiseSensor.getStatus()
app.js: renderSensorCard(sensor) ── reads ──▶ sensor (DOM лише тут)
```

## Як перевірено (автотест у Chromium, 33/33 ✓)
- Файлова структура з методички та `type="module"`.
- Числа 55 і 70 трапляються в коді рівно один раз — у `NOISE_LIMITS`; модель і сервіс не звертаються до `document`.
- Межі: 55 → normal, 56 → warning, 70 → warning, 71 → critical.
- Усі методи `MonitoringSystem` (знайдено / `null`, новий масив від `filter`, критичні NS-02/NS-03, порожня система → `null`, дубль і не-сенсор відхиляються).
- `updateNoiseLevel(NaN)` не змінює стан; `fromObject` без полів кидає помилку.
- На сторінці: 4 картки з правильними класами. Запис 75 dB для NS-01 перемальовує картку на `critical`; 250 dB — повідомлення про помилку; фільтр за районом працює.
