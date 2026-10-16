# ЛР3 — Адаптивна верстка: CSS Grid + SCSS

Mobile-first: базові стилі — для телефона, ширші екрани через `@include mq(md|lg)`.
Брейкпоінти: `sm 576px`, `md 768px`, `lg 1024px`.

## Структура SCSS
```
scss/
├── abstracts/  _variables (кольори, карта статусів, брейкпоінти), _mixins (mq, panel, auto-grid, transition), _index (@forward)
├── base/       _reset, _typography
├── layout/     _container, _header (flex + CSS-only бургер), _footer (grid)
├── components/ _buttons, _hero, _stats, _cards, _warning, _table, _form
└── main.scss   → css/style.css
```
Використано модульну систему `@use/@forward` (а не застарілий `@import`).

## Grid на сторінці
| Блок | Телефон | Планшет (md) | Десктоп (lg) |
|---|---|---|---|
| Hero | текст, під ним фото | те саме, фото 21:9 | 2 колонки, фото виходить за край контейнера |
| Показники | 2 колонки, «Статус» на весь рядок | 3 | 5 |
| Напрями | 1 → 2 (sm) | 2 | 4 |
| Форма (`grid-template-areas`) | 1 колонка | 2 колонки, опис на всю ширину | 3 колонки як у макеті, опис на 2 рядки |
| Футер | 1 колонка | `1fr auto` | — |

Flexbox — там, де вирівнювання одновимірне (header, навігація). Grid — двовимірні розкладки.

## Можливості SCSS
- змінні та карти (`$statuses`, `$breakpoints`) + `map.get`
- вкладеність і BEM через `&__element`, `&--modifier`
- міксини з параметрами та `@content` (`mq`), rest-аргументи (`transition($props...)`)
- `@each` (генерація `.status--ok/high`, grid-area полів форми), `@for` (хвилі в hero), `@if/@error` (неіснуючий брейкпоінт)

Таблиця на телефоні прокручується горизонтально (`.table-wrap { overflow-x: auto }`), меню ховається під бургер (checkbox-хак, без JS).

## Як перевірено (автотест у Chromium, 26/26 ✓)
- SCSS: 16 файлів, `@use/@forward`, `@mixin/@include/@content`, `@each`, `@for`, карти, вкладеність; компілюється без попереджень.
- Реальна кількість колонок Grid у браузері:

| Ширина | stats | cards | form |
|---|---|---|---|
| 390px | 2 | 1 | 1 |
| 800px | 3 | 2 | 2 |
| 1280px | 5 | 4 | 3 |

- На всіх трьох ширинах немає горизонтального скролу сторінки; бургер видимий лише < 768px і відкриває меню без JS.

## Компіляція
```bash
npm install && npm run build     # або: npx sass scss/main.scss css/style.css
```
