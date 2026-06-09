import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ElectronDistribution } from './properties-elements/electron-distribution/electron-distribution.component';
import { EmissionSpectrumComponent } from './emission-spectrum/emission-spectrum.component';
import { ButtonToggleModal } from '../../../shared/header/button-toggle-modal/button-toggle-modal.component';

@Component({
  selector: 'app-modal-periodic-table',
  standalone: true,
  templateUrl: './modal-periodic-table.html',
  styleUrls: ['./modal-periodic-table.scss'],
  imports: [ElectronDistribution, EmissionSpectrumComponent, ButtonToggleModal],
})
export class ModalPeriodicTable implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {}

  abrirLinkNist(): void {
    window.open(this.data.link_nist, '_blank');
  }
}
