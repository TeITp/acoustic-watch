import { NOISE_LIMITS, NOISE_RANGE, NOISE_STATUS } from "./noiseLimits.js";
import { NoiseMeasurement } from "./NoiseMeasurement.js";

/**
 * Фізичний датчик шуму в конкретній точці міста.
 * Стан: id, district, location, noiseLevel, measurements (композиція).
 * Поведінка: статус, оновлення рівня, додавання вимірювань.
 * НЕ відповідає за: пошук серед інших датчиків (MonitoringSystem)
 * і створення HTML (renderSensorCard у app.js).
 */
export class NoiseSensor {
  constructor(id, district, location, noiseLevel) {
    if (!NoiseSensor.isValidNoiseLevel(noiseLevel)) {
      throw new RangeError(`Датчик ${id}: некоректний рівень шуму ${noiseLevel}`);
    }

    this.id = id;
    this.district = district;
    this.location = location;
    this.noiseLevel = noiseLevel;
    this.measurements = []; // власна історія КОЖНОГО екземпляра
  }

  /** normal | warning | critical — за централізованими межами NOISE_LIMITS. */
  getStatus() {
    if (this.noiseLevel <= NOISE_LIMITS.normalMax) return NOISE_STATUS.NORMAL;
    if (this.noiseLevel <= NOISE_LIMITS.warningMax) return NOISE_STATUS.WARNING;
    return NOISE_STATUS.CRITICAL;
  }

  /** Перевіряє значення і лише потім змінює стан. */
  updateNoiseLevel(value) {
    if (!NoiseSensor.isValidNoiseLevel(value)) {
      throw new RangeError(`Некоректний рівень шуму: ${value}`);
    }
    this.noiseLevel = value;
  }

  /** Додає вимірювання в історію та оновлює поточний рівень. */
  addMeasurement(measurement) {
    if (!(measurement instanceof NoiseMeasurement)) {
      throw new TypeError("Очікується об'єкт NoiseMeasurement");
    }
    if (!measurement.isValid()) {
      throw new RangeError(`Некоректне вимірювання: ${measurement.value}`);
    }

    this.measurements.push(measurement);
    this.updateNoiseLevel(measurement.value); // повторно використовуємо перевірку
  }

  getLastMeasurement() {
    return this.measurements.at(-1) ?? null;
  }

  /** static: перевірка не залежить від стану конкретного датчика. */
  static isValidNoiseLevel(value) {
    return Number.isFinite(value) && value >= NOISE_RANGE.min && value <= NOISE_RANGE.max;
  }

  /** static-фабрика: plain object → екземпляр із перевіркою полів. */
  static fromObject(data) {
    const required = ["id", "district", "location", "noiseLevel"];
    const missing = required.filter(key => data?.[key] === undefined);

    if (missing.length > 0) {
      throw new TypeError(`fromObject: бракує полів ${missing.join(", ")}`);
    }

    return new NoiseSensor(data.id, data.district, data.location, data.noiseLevel);
  }
}
