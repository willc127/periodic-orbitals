import { Component, signal } from '@angular/core';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { PeriodicTable } from './components/tables/periodic-table/periodic-table';
import { ElectronDistribution } from './components/tables/periodic-table/modal-periodic-table/electron-distribution/electron-distribution';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, PeriodicTable, ElectronDistribution],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  protected readonly title = signal('periodic-orbitals-angular');
}
