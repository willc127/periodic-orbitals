import { Component, signal } from '@angular/core';
import { Header } from './shared/header/header.component';
import { Footer } from './shared/footer/footer.component';
import { PeriodicTable } from './pages/periodic-table/periodic-table.component';
import { ButtonToggle } from './shared/button-toggle/button-toggle.component';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, PeriodicTable, ButtonToggle],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  protected readonly title = signal('periodic-orbitals-angular');
}
