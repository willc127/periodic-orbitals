import { Component, signal } from '@angular/core';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { PeriodicTable } from './components/tables/periodic-table/periodic-table';
import{EmissionSpectrumComponent} from './components/tables/periodic-table/modal-periodic-table/emission-spectrum/emission-spectrum.component';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, PeriodicTable, EmissionSpectrumComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  protected readonly title = signal('periodic-orbitals-angular');
}
