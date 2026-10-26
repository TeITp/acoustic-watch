// =========================================================
// Акустична варта — Лабораторна робота №8
// TypeScript: interface Sensor, типізовані функції, fetch + MockAPI
// Компіляція: npx tsc  (src/sensors.ts → dist/sensors.js)
// =========================================================

// Опис одного сенсора, який повертає MockAPI
interface Sensor {
  id: string;
  name: string;
  district: string;
  noiseLevel: number;
  status: "active" | "inactive";
}

// Рівень шуму для кольору значення (пороги як у ЛР4–5)
type NoiseClass = "normal" | "warning" | "critical";

const API_URL: string = "https://6adf52148e42963c8d5dc359.mockapi.io/api/v1/sensors";

function getNoiseClass(noiseLevel: number): NoiseClass {
  if (noiseLevel <= 55) return "normal";
  if (noiseLevel <= 70) return "warning";
  return "critical";
}

// ---------- Відображення: приймає масив Sensor[] і створює картки ----------
function renderSensors(sensors: Sensor[]): void {
  const container = document.querySelector<HTMLDivElement>("#sensors");

  // querySelector може повернути null — strict-режим вимагає перевірки
  if (!container) {
    return;
  }

  container.innerHTML = "";

  sensors.forEach((sensor) => {
    const card = document.createElement("div");
    card.className = `sensor-card sensor-card--${sensor.status}`;

    card.innerHTML = `
      <div class="sensor-card__header">
        <h3 class="sensor-card__id">${sensor.name}</h3>
        <span class="sensor-card__status">${sensor.status}</span>
      </div>
      <p class="sensor-card__district">Район: ${sensor.district}</p>
      <p class="sensor-card__level">
        <span class="sensor-card__level-label">Рівень шуму:</span>
        <strong class="sensor-card__level-value sensor-card__level-value--${getNoiseClass(sensor.noiseLevel)}">${sensor.noiseLevel} дБ</strong>
      </p>
      <p class="sensor-card__state">Статус: ${sensor.status === "active" ? "активний" : "неактивний"}</p>
    `;

    container.appendChild(card);
  });
}

// ---------- Завантаження: GET-запит до MockAPI ----------
async function loadSensors(): Promise<void> {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Не вдалося завантажити сенсори");
    }

    const sensors: Sensor[] = await response.json();
    renderSensors(sensors);
  } catch (error) {
    console.error("Помилка:", error);

    const container = document.querySelector<HTMLDivElement>("#sensors");
    if (container) {
      container.innerHTML = '<p class="sensors__message sensors__message--error">Не вдалося завантажити дані.</p>';
    }
  }
}

loadSensors();
