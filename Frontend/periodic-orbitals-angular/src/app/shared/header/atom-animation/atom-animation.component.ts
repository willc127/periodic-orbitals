import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-atom-animation',
  imports: [],
  templateUrl: './atom-animation.html',
  styleUrl: './atom-animation.scss',
})
export class AtomAnimation {
  eletrons: number = 10;

  get eletronsList() {
    return Array.from({ length: this.eletrons }, (_, i) => i + 1);
  }

  @HostBinding('style.--total-eletrons') get totalEletrons() {
    return this.eletrons;
  }

  coresOrbitas = [
    '#FF8439',
    '#FFD400',
    '#354782',
    '#AA6B30',
    '#ACFF8B',
    '#1F7063',
    '#3DDED6',
    '#888529',
    '#6D3C9F',
    '#FF00AA'
  ];

  
}
