import { Component, Inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { ButtonToggleModal } from '../../../shared/button-toggle-modal/button-toggle-modal.component';
import { PropertiesElements } from './properties-elements/properties-elements.component';
import { EmissionSpectrumComponent } from './emission-spectrum/emission-spectrum.component';
import { Description } from './description/description.component';
import { OrbitalSurfaceViewerComponent } from './orbital-surface-viewer/orbital-surface-viewer.component';
import {
  ORBITALS,
  type OrbitalDef,
} from './orbital-surface-viewer/orbital.models';
import { OrbitalSelectionService } from './orbital-surface-viewer/orbital-selection.service';
import { DiagramaConfiguracaoEletronicaComponent } from './diagrama-configuracao-eletronica/diagrama-configuracao-eletronica.component';
import { MatIcon } from '@angular/material/icon';
import { IsotoposComponent } from './isotopos/isotopos.component';
import type { IElement } from '../../../interfaces/IElement';
@Component({
  selector: 'app-modal-periodic-table',
  standalone: true,
  templateUrl: './modal-periodic-table.html',
  styleUrls: ['./modal-periodic-table.scss'],
  imports: [
    ButtonToggleModal,
    PropertiesElements,
    EmissionSpectrumComponent,
    Description,
    OrbitalSurfaceViewerComponent,
    DiagramaConfiguracaoEletronicaComponent,
    MatIcon,
    MatDialogModule,
    IsotoposComponent,
  ],
})
export class ModalPeriodicTable {
  selectedView = signal('propriedades');
  readonly orbitalSelecionado = signal<OrbitalDef>(ORBITALS[0]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IElement,
    private readonly orbitalSelection: OrbitalSelectionService,
  ) {
    void this.carregarOrbital();
  }

  private async carregarOrbital(): Promise<void> {
    const orbital = await this.orbitalSelection.resolver(this.data);
    if (orbital) this.orbitalSelecionado.set(orbital);
  }

  onViewChange(newView: string): void {
    this.selectedView.set(newView);
  }

}
