import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ElectronDistribution } from './electron-distribution/electron-distribution.component';
import { EmissionSpectrumComponent } from './emission-spectrum/emission-spectrum.component';

@Component({
  selector: 'app-modal-periodic-table',
  standalone: true,
  templateUrl: './modal-periodic-table.html',
  styleUrls: ['./modal-periodic-table.scss'],
  imports: [ElectronDistribution, EmissionSpectrumComponent],
})
export class ModalPeriodicTable {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  abrirLinkNist(): void {
    window.open(this.data.link_nist, '_blank');
  }
}
