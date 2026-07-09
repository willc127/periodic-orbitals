import { Component, computed, inject, signal } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TemperatureStateService } from './temperature-selector.service';

@Component({
  selector: 'app-temperature-selector',
  imports: [
    MatSliderModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './temperature-selector.html',
  styleUrl: './temperature-selector.scss',
})
export class TemperatureSelector {
  private temperatureState = inject(TemperatureStateService);
  temperaturaKelvin = this.temperatureState.temperaturaKelvin;

  // Captura o valor inicial do signal assim que o componente é criado
  private readonly valorInicial = this.temperaturaKelvin();

  temperaturaCelsius = computed(() =>
    Math.round(this.temperaturaKelvin() - 273.15),
  );
  temperaturaFarenheit = computed(() =>
    Math.round((this.temperaturaCelsius() * 9) / 5 + 32),
  );

  // Definição das temperaturas máxima e mínima do seletor
  TEMP_MIN = 0;
  TEMP_MAX = 6000;

  onManualInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = Number(input.value);
    if (Number.isNaN(valor)) return;
    // clamp no range físico e do slider
    const clamped = Math.min(this.TEMP_MAX, Math.max(this.TEMP_MIN, valor));
    this.temperaturaKelvin.set(clamped);
    // corrige o input visualmente se o valor digitado foi fora do range
    if (clamped !== valor) {
      input.value = String(clamped);
    }
  }

  resetarTemperatura() {
    this.temperaturaKelvin.set(this.valorInicial);
  }
}