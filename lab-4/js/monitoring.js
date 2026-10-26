/* =========================================================
   Акустична варта — Лабораторна робота №4
   Аналіз серії вимірювань шуму: цикли, функції,
   функціональні вирази, callback, консольний звіт.
   Сторінку (DOM) скрипт НЕ змінює — тільки Console.
   ========================================================= */

"use strict";

/* ---------- Демонстрація п. 6.1.2 (тимчасово розкоментувати, потім прибрати) ----------
   console.log("monitoring.js завантажено");
   console.warn("Увага: у наборі є навмисно некоректні тестові записи");
   console.error("Демонстраційне повідомлення про помилку");
   → у Console видно тип повідомлення, фільтри Info/Warnings/Errors,
     а праворуч — джерело monitoring.js:рядок.
*/

/* ---------- 1. Вихідні дані ---------- */

const noiseLevels = [
  42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
  53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
  79, 39, 141, 86
];

const warningLevel = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;

// Простий об'єкт-набір порогів, щоб не передавати 4 окремі числа в кожну функцію
const limits = {
  min: minValidLevel,
  max: maxValidLevel,
  warning: warningLevel,
  critical: criticalLevel,
};

/* ---------- 2. Arrow Functions (малі допоміжні операції) ---------- */

// Один параметр — без дужок, implicit return
const statusLabel = value => `${value} dB`;

// Кілька параметрів — у дужках
const isAbove = (value, threshold) => value > threshold;

// Класифікація коректного значення; межі взято з умови:
// safe: level <= warning; warning: warning < level <= critical; critical: level > critical
const classifyLevel = (level, warning, critical) => {
  if (isAbove(level, critical)) return "critical";
  if (isAbove(level, warning)) return "warning";
  return "safe";
};

// Форматування лише для показу (кома як десятковий роздільник)
const formatDecimal = (value, digits = 2) =>
  value === null ? "немає даних" : value.toFixed(digits).replace(".", ",");


/* ---------- 3. Hoisting: виклик Function Declaration ДО її тексту ----------
   findFirstCritical оголошена нижче (розділ 5), але вже доступна тут,
   бо Function Declaration «піднімається» разом із тілом на етапі
   створення контексту виконання.
   Виклик стоїть ПІСЛЯ стрілкових функцій, бо findFirstCritical усередині
   використовує isAbove (const) — раніше був би ReferenceError (TDZ). */
const earlyCritical = findFirstCritical(noiseLevels, limits);

/* Експеримент для Console (у робочому файлі закоментовано):
   countByCategory(noiseLevels, limits);
   → ReferenceError: Cannot access 'countByCategory' before initialization
   const-змінна існує, але перебуває в TDZ (temporal dead zone)
   до рядка, де їй присвоюється функція. */

/* ---------- 4. Function Declaration: перевірка та статистика ---------- */

/** Чи є вимірювання коректним: скінченне число в [min, max]. */
function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}

/** Середнє коректних значень або null. for...of + continue. */
function calculateAverage(data, min, max) {
  let sum = 0;
  let count = 0;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) continue; // пропускаємо недостовірний запис
    sum += level;
    count++;
  }

  return count === 0 ? null : sum / count;
}

/** Мінімум коректних значень або null (без Math.min). */
function findMinimum(data, min, max) {
  let result = null;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) continue;
    if (result === null || level < result) result = level; // перший коректний — стартове значення
  }

  return result;
}

/** Максимум коректних значень або null (без Math.max). */
function findMaximum(data, min, max) {
  let result = null;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) continue;
    if (result === null || level > result) result = level;
  }

  return result;
}

/** Кількість усіх / коректних / некоректних записів. */
function countRecords(data, min, max) {
  let valid = 0;

  for (const level of data) {
    if (isValidLevel(level, min, max)) valid++;
  }

  return { total: data.length, valid, invalid: data.length - valid };
}

/** Некоректні записи з «людською» позицією (index + 1). Потрібен індекс → for. */
function collectInvalid(data, min, max) {
  const invalid = [];

  for (let i = 0; i < data.length; i++) {
    if (!isValidLevel(data[i], min, max)) {
      invalid.push({ position: i + 1, value: data[i] });
    }
  }

  return invalid;
}


/* ---------- 5. Пошукові алгоритми: for + break, while, do...while ---------- */

/**
 * Перше критичне вимірювання (Function Declaration — див. hoisting, розділ 3).
 * for з індексом, бо потрібна позиція; break — після першого збігу.
 * @returns {{value:number, index:number, position:number} | null}
 */
function findFirstCritical(data, lim) {
  let found = null;

  for (let i = 0; i < data.length; i++) {
    const level = data[i];
    if (isValidLevel(level, lim.min, lim.max) && isAbove(level, lim.critical)) {
      found = { value: level, index: i, position: i + 1 };
      break; // далі шукати не потрібно
    }
  }

  return found;
}

/**
 * Відновлення: три коректні вимірювання <= warning ПОСПІЛЬ
 * після першого критичного. while — бо кількість кроків невідома наперед,
 * умова завершення: знайдено серію АБО закінчився масив.
 * @returns {number|null} позиція третього безпечного вимірювання
 */
function findRecovery(data, lim, critical) {
  if (critical === null) return null;

  const required = 3;
  let streak = 0;
  let i = critical.index + 1;

  while (i < data.length && streak < required) {
    const level = data[i];

    if (isValidLevel(level, lim.min, lim.max) && !isAbove(level, lim.warning)) {
      streak++;
    } else {
      streak = 0; // некоректне або вище порога попередження — відлік спочатку
    }

    i++; // гарантує завершення циклу
  }

  // після останнього i++ індекс третього безпечного = i - 1, позиція = i
  return streak === required ? i : null;
}

/**
 * Перше коректне вимірювання. do...while: для НЕпорожнього масиву
 * перший елемент перевіряється гарантовано, умова — лише після перевірки.
 * Порожній масив відсікаємо окремо, інакше data[0] === undefined.
 */
function findFirstValid(data, min, max) {
  if (data.length === 0) return null;

  let i = 0;
  let found = null;

  do {
    if (isValidLevel(data[i], min, max)) {
      found = { value: data[i], position: i + 1 };
    }
    i++;
  } while (found === null && i < data.length);

  return found;
}


/* ---------- 6. Function Expression + callback ---------- */

/**
 * Підрахунок за категоріями — Function Expression у const.
 * Три класи взаємовиключні: safe + warning + critical === valid.
 */
const countByCategory = function (data, lim) {
  const counts = { safe: 0, warning: 0, critical: 0 };

  for (const level of data) {
    if (!isValidLevel(level, lim.min, lim.max)) continue;
    counts[classifyLevel(level, lim.warning, lim.critical)]++;
  }

  return counts;
};

/**
 * Функція вищого порядку: отримує алгоритм через параметр analyzer
 * і викликає його СИНХРОННО з даними й порогами.
 */
function analyzeWith(data, lim, analyzer) {
  return analyzer(data, lim);
}


/* ---------- 7. Збір звіту (тільки обчислення, без console) ---------- */

function buildReport(data, lim) {
  const records = countRecords(data, lim.min, lim.max);
  // countByCategory передаємо БЕЗ дужок — як значення-функцію (callback)
  const categories = analyzeWith(data, lim, countByCategory);
  const firstCritical = findFirstCritical(data, lim);

  return {
    records,
    categories,
    aboveWarning: categories.warning + categories.critical,
    average: calculateAverage(data, lim.min, lim.max),
    minimum: findMinimum(data, lim.min, lim.max),
    maximum: findMaximum(data, lim.min, lim.max),
    firstValid: findFirstValid(data, lim.min, lim.max),
    firstCritical,
    recoveryPosition: findRecovery(data, lim, firstCritical),
    invalid: collectInvalid(data, lim.min, lim.max),
  };
}

/** Текстовий висновок за результатами. */
function buildConclusion(report) {
  const { categories, firstCritical, recoveryPosition, records } = report;

  if (records.valid === 0) return "коректних даних для аналізу немає.";
  if (firstCritical === null) return "критичних вимірювань не зафіксовано.";

  const recovery = recoveryPosition === null
    ? "після першого з них стійкого відновлення не виявлено."
    : `стійке відновлення зафіксовано на позиції ${recoveryPosition}.`;

  return `зафіксовано ${categories.critical} критичні вимірювання; ${recovery}`;
}


/* ---------- 8. Представлення звіту в Console ---------- */

function printReport(report, lim, title = "Акустична варта — звіт моніторингу") {
  const { records, categories, firstCritical, recoveryPosition, invalid } = report;

  console.group(title);

  console.log(`Пороги: попередження > ${lim.warning} dB; критичний рівень > ${lim.critical} dB`);
  console.log(`Усього вимірювань: ${records.total}`);
  console.log(`Коректних: ${records.valid}`);
  console.log(`Некоректних: ${records.invalid}`);

  console.table({
    "Без перевищення": { "Кількість": categories.safe },
    "Попередження":    { "Кількість": categories.warning },
    "Критичні":        { "Кількість": categories.critical },
  });

  console.log(`Середній рівень: ${formatDecimal(report.average)} dB`);
  console.log(`Мінімальний рівень: ${report.minimum === null ? "немає даних" : statusLabel(report.minimum)}`);
  console.log(`Максимальний рівень: ${report.maximum === null ? "немає даних" : statusLabel(report.maximum)}`);

  console.log(firstCritical === null
    ? "Перше критичне вимірювання: не знайдено"
    : `Перше критичне вимірювання: ${statusLabel(firstCritical.value)}, позиція ${firstCritical.position}`);

  console.log(recoveryPosition === null
    ? "Відновлення — три безпечні вимірювання поспіль: не знайдено"
    : `Відновлення — три безпечні вимірювання поспіль: так, позиція ${recoveryPosition}`);

  if (report.aboveWarning > 0) {
    console.warn(`Поріг ${lim.warning} dB перевищено у ${report.aboveWarning} вимірюваннях.`);
  }

  if (invalid.length > 0) {
    // діагностика ВХІДНИХ даних, а не збій програми
    let list = "";
    for (let i = 0; i < invalid.length; i++) {
      list += `позиція ${invalid[i].position} (${statusLabel(invalid[i].value)})`;
      list += i < invalid.length - 1 ? ", " : ".";
    }
    console.error(`Некоректні дані: ${list}`);
  }

  console.log(`Висновок: ${buildConclusion(report)}`);

  console.groupEnd();
}


/* ---------- 9. Перевірка на окремих наборах (основний масив не змінюється) ---------- */

function runTests(lim) {
  const testSets = [
    { name: "Порожній набір []", data: [] },
    { name: "Лише некоректні [-1, 141]", data: [-1, 141] },
    { name: "Межі класів [70, 85, 86]", data: [70, 85, 86] },
    { name: "Серія перервана порогом", data: [90, 60, 65, 75, 50, 55, 60] },
    { name: "Серія перервана некоректним", data: [90, 60, 141, 50, 55, 58] },
  ];

  const rows = [];

  for (const set of testSets) {
    const r = buildReport(set.data, lim);
    rows.push({
      "Набір": set.name,
      "Коректних": r.records.valid,
      "Без/Попер/Крит": `${r.categories.safe}/${r.categories.warning}/${r.categories.critical}`,
      "Середнє": r.average === null ? null : Number(r.average.toFixed(2)),
      "Min": r.minimum,
      "Max": r.maximum,
      "Перший коректний": r.firstValid === null ? null : r.firstValid.position,
      "Перший критичний": r.firstCritical === null ? null : r.firstCritical.position,
      "Відновлення": r.recoveryPosition,
    });
  }

  console.groupCollapsed("Перевірка алгоритмів на тестових наборах");
  console.table(rows);
  console.groupEnd();
}


/* ---------- 10. Запуск ---------- */

const report = buildReport(noiseLevels, limits);
printReport(report, limits);
runTests(limits);

// Контроль hoisting: результат раннього виклику збігається зі звітом
console.assert(
  earlyCritical !== null && earlyCritical.position === report.firstCritical.position,
  "Ранній виклик findFirstCritical дав інший результат"
);

/* ---------- Підказки для перевірки виразів у Console (п. 6.1.3) ----------
   noiseLevels.length                       // 28
   isValidLevel(-1, 30, 130)                // false
   isValidLevel(130, 30, 130)               // true  (межа включно)
   classifyLevel(85, 70, 85)                // "warning"
   classifyLevel(86, 70, 85)                // "critical"
   typeof findFirstCritical                 // "function"
   findRecovery([90, 50, 55, 60], limits, findFirstCritical([90, 50, 55, 60], limits)) // 4
*/
