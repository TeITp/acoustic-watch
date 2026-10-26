// =========================================================
// Акустична варта — Лабораторна робота №6
// Відображення та фільтрація сенсорів у DOM
// (querySelector, createElement, textContent, classList,
//  replaceChildren, filter, addEventListener("change"))
// =========================================================

// ---------- 1. Дані сенсорів ----------
const sensors = [
  { id: "NS-01", district: "Галицький",      location: "просп. Свободи, 14",     noiseLevel: 52, status: "normal" },
  { id: "NS-02", district: "Франківський",   location: "вул. Наукова, 8",        noiseLevel: 68, status: "warning" },
  { id: "NS-03", district: "Шевченківський", location: "просп. Чорновола, 21",   noiseLevel: 83, status: "critical" },
  { id: "NS-04", district: "Сихівський",     location: "вул. Зелена, 102",       noiseLevel: 49, status: "normal" },
  { id: "NS-05", district: "Личаківський",   location: "вул. Пасічна, 30",       noiseLevel: 71, status: "warning" },
  { id: "NS-06", district: "Залізничний",    location: "вул. Городоцька, 155",   noiseLevel: 86, status: "critical" },
  { id: "NS-07", district: "Галицький",      location: "пл. Ринок, 1",           noiseLevel: 79, status: "critical" },
  { id: "NS-08", district: "Сихівський",     location: "просп. Червоної Калини, 60", noiseLevel: 74, status: "warning" },
];

// ---------- 2. Пошук DOM-елементів ----------
const sensorList = document.querySelector(".sensor-list");
const districtFilter = document.querySelector("#district-filter");
const criticalFilter = document.querySelector("#critical-filter");

// Допоміжна функція: створює елемент із класом і текстом (тільки textContent — без innerHTML)
function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

// ---------- 3. Створення картки сенсора ----------
function createSensorCard(sensor) {
  const card = document.createElement("article");
  card.classList.add("sensor-card");
  card.classList.add(`sensor-card--${sensor.status}`);

  // Шапка: ID + статус-«пігулка»
  const header = document.createElement("div");
  header.classList.add("sensor-card__header");

  const title = createTextElement("h3", "sensor-card__id", sensor.id);
  const status = createTextElement("span", "sensor-card__status", sensor.status);
  status.title = `Статус: ${sensor.status}`;
  header.append(title, status);

  // Район і локація (іконки додає CSS через ::before)
  const district = createTextElement("p", "sensor-card__district", `${sensor.district} район`);
  district.title = "Район";

  const location = createTextElement("p", "sensor-card__location", sensor.location);
  location.title = "Локація";

  // Рівень шуму
  const level = document.createElement("p");
  level.classList.add("sensor-card__level");
  const levelLabel = createTextElement("span", "sensor-card__level-label", "Рівень шуму:");
  const levelValue = createTextElement("strong", "sensor-card__level-value", `${sensor.noiseLevel} дБ`);
  level.append(levelLabel, levelValue);

  card.append(header, district, location, level);
  return card;
}

// ---------- 4. Відображення масиву сенсорів ----------
function renderSensors(sensorArray) {
  sensorList.replaceChildren(); // очищуємо контейнер

  sensorArray.forEach((sensor) => {
    const card = createSensorCard(sensor);
    sensorList.append(card);
  });
}

// ---------- 5. Фільтрація ----------
function applyFilters() {
  const selectedDistrict = districtFilter.value;
  const criticalOnly = criticalFilter.checked;

  const filteredSensors = sensors.filter((sensor) => {
    const matchesDistrict =
      selectedDistrict === "all" ||
      sensor.district === selectedDistrict;

    const matchesStatus =
      !criticalOnly ||
      sensor.status === "critical";

    return matchesDistrict && matchesStatus;
  });

  renderSensors(filteredSensors);
}

// ---------- 6. Обробка зміни фільтрів ----------
districtFilter.addEventListener("change", applyFilters);
criticalFilter.addEventListener("change", applyFilters);

// ---------- 7. Початковий показ усіх сенсорів ----------
renderSensors(sensors);
