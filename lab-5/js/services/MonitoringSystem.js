import { NoiseSensor } from "../models/NoiseSensor.js";
import { NOISE_STATUS } from "../models/noiseLimits.js";

/**
 * Система, що працює з КОЛЕКЦІЄЮ датчиків (композиція:
 * MonitoringSystem → NoiseSensor[]). Додавання, пошук,
 * фільтрація, агрегація. Правил класифікації тут немає —
 * статус визначає сам датчик через getStatus().
 */
export class MonitoringSystem {
  constructor() {
    this.sensors = [];
  }

  /** Додає екземпляр NoiseSensor; дубль id відхиляється винятком. */
  addSensor(sensor) {
    if (!(sensor instanceof NoiseSensor)) {
      throw new TypeError("Можна додавати лише об'єкти NoiseSensor");
    }
    if (this.findSensorById(sensor.id) !== null) {
      throw new Error(`Датчик ${sensor.id} вже існує`);
    }
    this.sensors.push(sensor);
    return this; // дозволяє ланцюжок system.addSensor(a).addSensor(b)
  }

  /** find: один об'єкт або null (передбачуване значення, а не undefined). */
  findSensorById(id) {
    return this.sensors.find(sensor => sensor.id === id) ?? null;
  }

  /** filter: НОВИЙ масив датчиків району. */
  getSensorsByDistrict(district) {
    return this.sensors.filter(sensor => sensor.district === district);
  }

  getSensorsByStatus(status) {
    return this.sensors.filter(sensor => sensor.getStatus() === status);
  }

  getCriticalSensors() {
    return this.getSensorsByStatus(NOISE_STATUS.CRITICAL);
  }

  /** reduce: середнє для непорожньої колекції; для порожньої — null. */
  getAverageNoiseLevel() {
    if (this.sensors.length === 0) return null;
    const total = this.sensors.reduce((sum, sensor) => sum + sensor.noiseLevel, 0);
    return total / this.sensors.length;
  }

  /** map + Set: перелік унікальних районів (для фільтра на сторінці). */
  getDistricts() {
    return [...new Set(this.sensors.map(sensor => sensor.district))];
  }

  /** Кількість датчиків у кожному статусі. */
  getStatusSummary() {
    const summary = { normal: 0, warning: 0, critical: 0 };
    for (const sensor of this.sensors) summary[sensor.getStatus()]++;
    return summary;
  }
}
