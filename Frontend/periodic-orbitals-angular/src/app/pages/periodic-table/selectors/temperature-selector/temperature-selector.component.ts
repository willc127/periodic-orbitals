import { Component, computed, inject, signal } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TemperatureStateService } from './temperature-selector.service';

@Component({
  selector: 'app-temperature-selector',
  imports: [MatSliderModule, MatInputModule, MatFormFieldModule],
  templateUrl: './temperature-selector.html',
  styleUrl: './temperature-selector.scss',
})
export class TemperatureSelector {
  private temperatureState = inject(TemperatureStateService);
  temperaturaKelvin = this.temperatureState.temperaturaKelvin;

  temperaturaCelsius = computed(() =>
    Math.round(this.temperaturaKelvin() - 273.15),
  );

  temperaturaFarenheit = computed(() =>
    Math.round((this.temperaturaCelsius() * 9) / 5 + 32),
  );

  onManualInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = Number(input.value);

    if (Number.isNaN(valor)) return;

    // clamp no range físico e do slider (0K é o zero absoluto, mas seu min é -273)
    const clamped = Math.min(6000, Math.max(-273, valor));
    this.temperaturaKelvin.set(clamped);

    // corrige o input visualmente se o valor digitado foi fora do range
    if (clamped !== valor) {
      input.value = String(clamped);
    }
  }

  readonly TEMP_MIN = 0;
  readonly TEMP_MAX = 6000;

}