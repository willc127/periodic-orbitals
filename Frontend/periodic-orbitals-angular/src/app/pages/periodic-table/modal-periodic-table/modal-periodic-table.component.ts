import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ButtonToggleModal } from '../../../shared/button-toggle-modal/button-toggle-modal.component';
import { PropertiesElements } from './properties-elements/properties-elements.component';
import { EmissionSpectrumComponent } from './emission-spectrum/emission-spectrum.component';
import { Description } from './description/description.component';
import { QuantumOrbitalViewerComponent } from "./quantum-orbital-viewer/quantum-orbital-viewer.component";
import { DiagramaConfiguracaoEletronicaComponent } from "./diagrama-configuracao-eletronica/diagrama-configuracao-eletronica.component";
import { MatIcon } from "@angular/material/icon";
@Component({
  selector: 'app-modal-periodic-table',
  standalone: true,
  templateUrl: './modal-periodic-table.html',
  styleUrls: ['./modal-periodic-table.scss'],
  imports: [ButtonToggleModal, PropertiesElements, EmissionSpectrumComponent, Description, QuantumOrbitalViewerComponent, DiagramaConfiguracaoEletronicaComponent, MatIcon, MatDialogModule],
})
export class ModalPeriodicTable {
  selectedView = signal('propriedades');

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  onViewChange(newView: string): void {
    this.selectedView.set(newView);
  }

  


}
