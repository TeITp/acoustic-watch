import { NoiseSensor } from "./NoiseSensor.js";

/**
 * MobileNoiseSensor «є різновидом» NoiseSensor:
 * успадковує статус, вимірювання, перевірки і додає
 * власний стан (заряд батареї) та поведінку (переміщення, зарядка).
 */
export class MobileNoiseSensor extends NoiseSensor {
  static LOW_BATTERY = 20; // %, поріг для needsCharging()

  constructor(id, district, location, noiseLevel, batteryLevel) {
    super(id, district, location, noiseLevel); // спершу батьківська частина стану
    this.batteryLevel = batteryLevel;          // this доступний лише після super()
  }

  needsCharging() {
    return this.batteryLevel < MobileNoiseSensor.LOW_BATTERY;
  }

  /** Мобільний датчик можна перенести в іншу точку міста. */
  relocate(district, location) {
    this.district = district;
    this.location = location;
  }

  /** Кожне вимірювання витрачає 1% заряду; далі — логіка батька. */
  addMeasurement(measurement) {
    super.addMeasurement(measurement);
    this.batteryLevel = Math.max(0, this.batteryLevel - 1);
  }
}
