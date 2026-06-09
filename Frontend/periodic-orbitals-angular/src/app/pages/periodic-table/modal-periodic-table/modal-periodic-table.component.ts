import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ButtonToggleModal } from '../../../shared/button-toggle-modal/button-toggle-modal.component';
import { PropertiesElements } from './properties-elements/properties-elements.component';
import { EmissionSpectrumComponent } from './emission-spectrum/emission-spectrum.component';
@Component({
  selector: 'app-modal-periodic-table',
  standalone: true,
  templateUrl: './modal-periodic-table.html',
  styleUrls: ['./modal-periodic-table.scss'],
  imports: [ButtonToggleModal, PropertiesElements, EmissionSpectrumComponent],
})
export class ModalPeriodicTable {
  selectedView = signal('padrao');

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  onViewChange(newView: string): void {
    this.selectedView.set(newView);
  }

  abrirLinkNist(): void {
    window.open(this.data.link_nist, '_blank');
  }
}
