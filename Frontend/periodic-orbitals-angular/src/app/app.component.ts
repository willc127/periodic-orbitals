import { Component, signal } from '@angular/core';
import { Header } from './shared/header/header.component';
import { Footer } from './shared/footer/footer.component';
import { PeriodicTable } from './pages/periodic-table/periodic-table.component';
import { GraphicsComponent } from './pages/graphics/graphics.component';
@Component({
  selector: 'app-root',
  imports: [Header, Footer, PeriodicTable, GraphicsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  protected readonly title = signal('periodic-orbitals-angular');
  protected readonly activeView = signal<'padrao' | 'graficos'>('padrao');

  onViewChange(view: 'padrao' | 'graficos') {
    this.activeView.set(view);
  }
}
