/**
 * Централізовані бізнес-правила «Акустичної варти».
 * Числа 55 / 70 існують ТІЛЬКИ тут — getStatus() та інші методи
 * звертаються до цієї конфігурації, а не дублюють межі.
 */

// Класифікація: <= 55 normal; (55; 70] warning; > 70 critical
export const NOISE_LIMITS = Object.freeze({
  normalMax: 55,
  warningMax: 70,
});

// Фізично допустимий діапазон показника датчика
export const NOISE_RANGE = Object.freeze({
  min: 0,
  max: 200,
});

export const NOISE_STATUS = Object.freeze({
  NORMAL: "normal",
  WARNING: "warning",
  CRITICAL: "critical",
});
