import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { gameMolecule } from '@ng-icons/game-icons';

@Component({
  selector: 'app-button-toggle-principal',
  imports: [
    MatButtonToggleModule,
    MatCheckboxModule,
    NgIcon,
    MatButtonToggleModule,
  ],
  providers: [
    provideIcons({ gameMolecule }),
  ],
  templateUrl: './button-toggle-principal.html',
  styleUrl: './button-toggle-principal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ButtonTogglePrincipal {
  checked = signal('padrao');
  hideSingleSelectionIndicator = signal(false);
  hideMultipleSelectionIndicator = signal(false);

  viewChanged = output<'padrao' | 'graficos' | 'molecula'>();

  onViewChange(value: string) {
    this.checked.set(value);
    this.viewChanged.emit(value as 'padrao' | 'graficos' | 'molecula');
  }

  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update((value) => !value);
  }

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update((value) => !value);
  }
}
