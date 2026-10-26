import { NOISE_RANGE } from "./noiseLimits.js";

/**
 * Одне вимірювання рівня шуму в певний момент часу.
 * Незмінне значення + час; уміє перевірити себе і відформатуватися.
 */
export class NoiseMeasurement {
  constructor(value, measuredAt = new Date()) {
    this.value = value;
    this.measuredAt = measuredAt instanceof Date ? measuredAt : new Date(measuredAt);
  }

  isValid() {
    return (
      Number.isFinite(this.value) &&
      this.value >= NOISE_RANGE.min &&
      this.value <= NOISE_RANGE.max &&
      !Number.isNaN(this.measuredAt.getTime())
    );
  }

  /** Час у форматі ГГ:ХХ (для журналу на сторінці). */
  getTimeLabel() {
    return this.measuredAt.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  }

  toString() {
    return `${this.value} dB о ${this.getTimeLabel()}`;
  }
}
