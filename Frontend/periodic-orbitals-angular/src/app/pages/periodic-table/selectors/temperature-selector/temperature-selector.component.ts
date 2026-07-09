import { Component, computed, signal } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
@Component({
  selector: 'app-temperature-selector',
  imports: [MatSliderModule],
  templateUrl: './temperature-selector.html',
  styleUrl: './temperature-selector.scss',
})
export class TemperatureSelector {
  temperaturaKelvin = signal(298); // Kelvin

  temperaturaCelsius = computed(() =>
    Math.round(this.temperaturaKelvin() - 273.15),
  );
  
  temperaturaFarenheit = computed(() =>
    Math.round((this.temperaturaCelsius() * 9) / 5 + 32),
  );
}
