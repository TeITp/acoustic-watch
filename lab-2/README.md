# ЛР2 — Верстка сайту компанії (HTML/CSS)

Без JS, без фреймворків, без Flexbox/Grid (це тема ЛР3) — розкладка на `inline-block`.

## Де що в `css/style.css`
| Вимога | Де |
|---|---|
| Універсальний селектор, `box-sizing: border-box` | розділ 1 |
| Селектори елементів / групування | розділ 2 (`h1, h2, h3`), футер |
| Клас, id, атрибут | `.card`, `#services .card__title`, `input[type="email"]`, `input[required]:focus` |
| Box Model (width/height/padding/border/margin) | `.stat` (фіксована `height: 120px`), `.card`, `.container` |
| `display: block / inline-block / inline` | `.brand__name` — block; `.stat`, `.card`, `.main-nav__link` — inline-block; `.footer-nav a` — inline |
| `position: relative` + `absolute` | `.warning` + `.warning__tag` («Точка №4») |
| `transition` | `.btn`, `.card`, `.main-nav__link`, рядки таблиці |
| `transform` | декоративні хвилі `.sensor-deco__wave` (rotate + scale), hover `.btn`/`.card` (translate) |
| Hover змінює колір кнопки | `.btn:hover` |
| Навмисний конфлікт правил | **Конфлікт №1** (розділ 10) і **№2** (розділ 11) — з коментарями |

## Конфлікт для захисту
```css
#services .card__title { color: #0f1b33; }  /* (1,1,0) — перемагає */
.card__title           { color: #2f7d32; }  /* (0,1,0) — перекреслене в DevTools */
```
Перемагає більша specificity, хоча правило вище у файлі. Порядок у файлі вирішує лише при однаковій specificity.

`inline-block` у ряд: пробіли між тегами в HTML рендеряться як текстовий пробіл, тому батьку дано `font-size: 0`, а дітям — повернуто `16px`.

## Як перевірено (автотест у Chromium, 45/45 ✓)
- Є всі семантичні теги; CSS підключено через `<link>`; немає JS, Flexbox/Grid і фреймворків.
- У CSS є всі типи селекторів і всі властивості з таблиці CSS-модулів методички.
- Обчислені стилі в браузері: `.card` — `inline-block`; `.stat` — `border-box`; `.warning` — `relative`; позначка — `absolute`; на хвилях датчика є `transform`.
- Обидва конфлікти дають очікуваний переможець (`#services .card__title`, `.warning__text`).
- Hover справді змінює колір кнопки; форма має 5 `label[for]` і 4 `required`.

## Що показати на захисті
1. DevTools → Elements → `.card__title` → Styles: перекреслене правило `.card__title { color }`.
2. Computed → Box Model для `.stat` (height 120px вже включає padding+border).
3. Навести на кнопку/картку — плавний перехід.

Сторінка не адаптивна навмисно — адаптив є темою ЛР3.
