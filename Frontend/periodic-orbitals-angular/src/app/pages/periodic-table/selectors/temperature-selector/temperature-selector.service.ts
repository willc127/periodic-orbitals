import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TemperatureStateService {
  temperaturaKelvin = signal(298);
}