import { Component, signal } from '@angular/core';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { PeriodicTable } from './components/periodic-table/periodic-table';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, PeriodicTable],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  protected readonly title = signal('periodic-orbitals-angular');
}
