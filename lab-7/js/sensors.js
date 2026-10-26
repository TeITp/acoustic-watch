// =========================================================
// Акустична варта — Лабораторна робота №7
// Завантаження даних з публічного API та відображення на сторінці
// MockAPI → fetch() → response.json() → масив sensors → renderSensors() → картки
// =========================================================

// Endpoint ресурсу sensors у MockAPI (prefix /api/v1)
const API_URL = "https://6adf52148e42963c8d5dc359.mockapi.io/api/v1/sensors";

// Допоміжна функція: рівень шуму → клас кольору значення
// (пороги як у ЛР4–5: ≤55 норма, ≤70 підвищений, >70 критичний)
function getNoiseClass(noiseLevel) {
  if (noiseLevel <= 55) return "normal";
  if (noiseLevel <= 70) return "warning";
  return "critical";
}

// ---------- Завантаження даних (тільки fetch, без DOM-розмітки карток) ----------
async function loadSensors() {
  try {
    // 1-й await — чекаємо HTTP-відповідь (об'єкт Response)
    const response = await fetch(API_URL);

    // fetch не кидає помилку на 404/500 — перевіряємо самі
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    // 2-й await — читаємо тіло і перетворюємо JSON у масив JavaScript
    const sensors = await response.json();
    console.log("Отримано сенсорів:", sensors.length, sensors);

    renderSensors(sensors);
  } catch (error) {
    console.error("Не вдалося завантажити сенсори:", error);

    const container = document.querySelector("#sensors-list");
    container.innerHTML = '<p class="sensors__message sensors__message--error">Не вдалося завантажити дані.</p>';
  }
}

// ---------- Відображення (не звертається до API — лише малює отриманий масив) ----------
function renderSensors(sensors) {
  const container = document.querySelector("#sensors-list");
  container.innerHTML = "";

  if (sensors.length === 0) {
    container.innerHTML = '<p class="sensors__message">Сенсорів поки немає.</p>';
    return;
  }

  sensors.forEach((sensor) => {
    const card = document.createElement("article");
    card.classList.add("sensor-card");
    card.classList.add(`sensor-card--${sensor.status}`); // active / inactive

    card.innerHTML = `
      <div class="sensor-card__header">
        <h3 class="sensor-card__id">${sensor.name}</h3>
        <span class="sensor-card__status" title="Статус">${sensor.status}</span>
      </div>
      <p class="sensor-card__district" title="Район">Район: ${sensor.district}</p>
      <p class="sensor-card__level">
        <span class="sensor-card__level-label">Рівень шуму:</span>
        <strong class="sensor-card__level-value sensor-card__level-value--${getNoiseClass(sensor.noiseLevel)}">${sensor.noiseLevel} дБ</strong>
      </p>
    `;

    container.append(card);
  });
}

loadSensors();
