/* =========================================================
   Акустична варта — Лабораторна робота №5
   app.js: ініціалізація моделі та інтеграція зі сторінкою.
   Модель (models/, services/) нічого не знає про DOM.
   ========================================================= */

import { NoiseSensor } from "./models/NoiseSensor.js";
import { MobileNoiseSensor } from "./models/MobileNoiseSensor.js";
import { NoiseMeasurement } from "./models/NoiseMeasurement.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";
import { NOISE_RANGE } from "./models/noiseLimits.js";

/* ---------- 1. Початкові дані (plain objects) ---------- */

const sensorsData = [
  { id: "NS-01", district: "Галицький",      location: "просп. Свободи",   noiseLevel: 58 },
  { id: "NS-02", district: "Франківський",   location: "вул. Наукова",     noiseLevel: 74 },
  { id: "NS-03", district: "Шевченківський", location: "просп. Чорновола", noiseLevel: 83 },
];

/* ---------- 2. Plain objects → екземпляри NoiseSensor ----------
   map + static-фабрика fromObject: кожен об'єкт перевіряється
   (наявність полів, допустимий рівень) і стає повноцінним екземпляром
   з методами getStatus(), addMeasurement() тощо через prototype. */
const sensors = sensorsData.map(data => NoiseSensor.fromObject(data));

const system = new MonitoringSystem();
sensors.forEach(sensor => system.addSensor(sensor));

/* ---------- 3. Контроль на стартових даних (до додавання мобільного) ---------- */

console.group("ЛР5 · Контрольні значення стартових даних");
for (const sensor of system.sensors) {
  console.log(`${sensor.id} = ${sensor.noiseLevel} dB → ${sensor.getStatus()}`);
}
console.log(`Середній рівень: ${system.getAverageNoiseLevel().toFixed(2)} dB (очікується ≈ 71.67)`);
console.log("Критичні:", system.getCriticalSensors().map(s => s.id));
console.log("findSensorById('NS-02'):", system.findSensorById("NS-02"));
console.log("findSensorById('NS-99'):", system.findSensorById("NS-99"));
console.log("getSensorsByDistrict('Галицький'):", system.getSensorsByDistrict("Галицький"));
console.groupEnd();

/* ---------- 4. Наслідування: мобільний датчик ---------- */

const mobile = new MobileNoiseSensor("NS-M1", "Личаківський", "вул. Личаківська (пересувний пост)", 52, 18);
system.addSensor(mobile); // instanceof NoiseSensor === true → система приймає

// Історія вимірювань (композиція NoiseSensor → NoiseMeasurement[])
const today = new Date();
const at = (h, m) => new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m);

system.findSensorById("NS-01").addMeasurement(new NoiseMeasurement(54, at(10, 0)));
system.findSensorById("NS-01").addMeasurement(new NoiseMeasurement(61, at(10, 5)));
system.findSensorById("NS-01").addMeasurement(new NoiseMeasurement(58, at(10, 10)));
mobile.addMeasurement(new NoiseMeasurement(52, at(10, 15)));

/* ---------- 5. Консольні експерименти (prototype, власні властивості, this) ---------- */

function runConsoleExperiments() {
  console.groupCollapsed("ЛР5 · Експерименти з prototype та екземплярами");

  const sensorA = new NoiseSensor("T-A", "Тест", "точка A", 50);
  const sensorB = new NoiseSensor("T-B", "Тест", "точка B", 50);

  sensorA.updateNoiseLevel(80);
  console.log("Незалежний стан:", sensorA.noiseLevel, sensorB.noiseLevel);            // 80 50

  console.log("A.getStatus === B.getStatus:", sensorA.getStatus === sensorB.getStatus); // true
  console.log("hasOwn(A, 'noiseLevel'):", Object.hasOwn(sensorA, "noiseLevel"));        // true
  console.log("hasOwn(A, 'getStatus'):", Object.hasOwn(sensorA, "getStatus"));          // false
  console.log("getStatus у prototype:", Object.hasOwn(NoiseSensor.prototype, "getStatus")); // true
  console.log("Окремі масиви measurements:", sensorA.measurements !== sensorB.measurements); // true

  console.log("static через клас:", NoiseSensor.isValidNoiseLevel(74));                 // true
  console.log("static через екземпляр:", typeof sensorA.isValidNoiseLevel);             // undefined

  console.log("mobile instanceof NoiseSensor:", mobile instanceof NoiseSensor);         // true
  console.log("Ланцюжок прототипів:",
    Object.getPrototypeOf(MobileNoiseSensor.prototype) === NoiseSensor.prototype);       // true
  console.log("mobile.needsCharging():", mobile.needsCharging());                        // true (заряд < 20%)

  // Втрата this: метод, відірваний від об'єкта
  const fn = sensorA.getStatus;
  try {
    fn();
  } catch (error) {
    console.log("fn() без об'єкта →", error.constructor.name, "— this === undefined у класі (strict mode)");
  }
  console.log("fn.call(sensorA):", fn.call(sensorA));

  // Валідація: некоректне значення не змінює стан
  try {
    sensorB.updateNoiseLevel(-5);
  } catch (error) {
    console.log("updateNoiseLevel(-5) →", error.message, "| стан:", sensorB.noiseLevel);
  }

  // Дубль id
  try {
    system.addSensor(new NoiseSensor("NS-01", "Галицький", "дубль", 40));
  } catch (error) {
    console.log("Дубль id →", error.message);
  }

  console.groupEnd();
}

runConsoleExperiments();

/* =========================================================
   6. Шар представлення (DOM). Не методи NoiseSensor:
   створення HTML — не поведінка фізичного датчика.
   ========================================================= */

const STATUS_LABELS = {
  normal: "Норма",
  warning: "Попередження",
  critical: "Критичний",
};

const els = {
  grid: document.querySelector("#sensor-grid"),
  summary: document.querySelector("#sensors-summary"),
  district: document.querySelector("#district-filter"),
  criticalOnly: document.querySelector("#critical-only"),
  form: document.querySelector("#measure-form"),
  formSensor: document.querySelector("#measure-sensor"),
  formValue: document.querySelector("#measure-value"),
  message: document.querySelector("#measure-message"),
};

/** Невеликий помічник створення елемента. */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Картка датчика. Статус береться ТІЛЬКИ з sensor.getStatus() — без 55/70. */
function renderSensorCard(sensor) {
  const status = sensor.getStatus();

  const card = el("article", `sensor-card ${status}`);
  card.dataset.id = sensor.id;

  const head = el("header", "sensor-card__head");
  head.append(
    el("h3", "sensor-card__id", sensor.id),
    el("span", "sensor-card__status", `${status} · ${STATUS_LABELS[status]}`)
  );

  const level = el("p", "sensor-card__level");
  level.append(String(sensor.noiseLevel), el("small", "", " dB"));

  const meta = el("dl", "sensor-card__meta");
  const addRow = (term, value) => meta.append(el("dt", "", term), el("dd", "", value));
  addRow("Район", sensor.district);
  addRow("Адреса", sensor.location);

  const last = sensor.getLastMeasurement();
  addRow("Останнє", last ? last.toString() : "немає вимірювань");
  addRow("Історія", `${sensor.measurements.length} вимір.`);

  if (sensor instanceof MobileNoiseSensor) {
    addRow("Батарея", `${sensor.batteryLevel}%${sensor.needsCharging() ? " — потрібна зарядка" : ""}`);
    card.classList.add("sensor-card--mobile");
  }

  card.append(head, level, meta);
  return card;
}

function renderSummary() {
  const average = system.getAverageNoiseLevel();
  const summary = system.getStatusSummary();

  const items = [
    ["Датчиків", system.sensors.length],
    ["Середній рівень", average === null ? "—" : `${average.toFixed(1)} dB`],
    ["Норма", summary.normal],
    ["Попередження", summary.warning],
    ["Критичні", system.getCriticalSensors().length],
  ];

  els.summary.replaceChildren(
    ...items.map(([label, value]) => {
      const box = el("div", "sensors-summary__item");
      box.append(el("span", "sensors-summary__label", label), el("strong", "sensors-summary__value", String(value)));
      return box;
    })
  );
}

/** Вибірка через методи системи — без дублювання масивів. */
function getVisibleSensors() {
  const district = els.district.value;
  let list = district === "all" ? system.sensors : system.getSensorsByDistrict(district);

  if (els.criticalOnly.checked) {
    const critical = system.getCriticalSensors();
    list = list.filter(sensor => critical.includes(sensor));
  }
  return list;
}

function renderSensors() {
  const visible = getVisibleSensors();
  els.grid.replaceChildren(
    ...(visible.length > 0
      ? visible.map(renderSensorCard)
      : [el("p", "sensor-grid__empty", "Немає датчиків за обраним фільтром.")])
  );
}

function renderSelectOptions() {
  for (const district of system.getDistricts()) {
    els.district.append(new Option(district, district));
  }
  for (const sensor of system.sensors) {
    els.formSensor.append(new Option(`${sensor.id} — ${sensor.location}`, sensor.id));
  }
}

function render() {
  renderSummary();
  renderSensors();
}

/* ---------- 7. Події ---------- */

els.district.addEventListener("change", renderSensors);
els.criticalOnly.addEventListener("change", renderSensors);

els.form.addEventListener("submit", event => {
  event.preventDefault();

  const sensor = system.findSensorById(els.formSensor.value);
  const raw = els.formValue.value.trim();
  const value = raw === "" ? NaN : Number(raw);

  try {
    const before = sensor.getStatus();
    sensor.addMeasurement(new NoiseMeasurement(value));
    const after = sensor.getStatus();

    els.message.className = "measure-form__message is-ok";
    els.message.textContent = before === after
      ? `${sensor.id}: записано ${value} dB, статус ${after}.`
      : `${sensor.id}: записано ${value} dB, статус змінено ${before} → ${after}.`;

    els.formValue.value = "";
    render(); // повторний рендеринг показує новий стан об'єкта
  } catch (error) {
    els.message.className = "measure-form__message is-error";
    els.message.textContent = `Помилка: ${error.message}. Допустимо ${NOISE_RANGE.min}–${NOISE_RANGE.max} dB.`;
  }
});

/* ---------- 8. Старт ---------- */

renderSelectOptions();
render();

// Доступ із Console для ручних перевірок: aw.system, aw.NoiseSensor ...
window.aw = { system, NoiseSensor, MobileNoiseSensor, NoiseMeasurement, render };
