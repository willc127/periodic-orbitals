import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { PeriodicTable } from './components/periodic-table/periodic-table';
import { AtomAnimation } from './components/atom-animation/atom-animation';
import { ElectronDistribution } from './components/electron-distribution/electron-distribution';
import { ElementProperties } from './components/element-properties/element-properties';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    Footer,
    PeriodicTable,
    AtomAnimation,
    ElectronDistribution,
    ElementProperties
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('periodic-orbitals-angular');
}
