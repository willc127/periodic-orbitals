import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-button-toggle-principal',
  imports: [MatButtonToggleModule, MatCheckboxModule],
  templateUrl: './button-toggle-principal.html',
  styleUrl: './button-toggle-principal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ButtonTogglePrincipal {
  checked = signal('padrao');
  hideSingleSelectionIndicator = signal(false);
  hideMultipleSelectionIndicator = signal(false);

  viewChanged = output<'padrao' | 'graficos'>();

  onViewChange(value: string) {
    this.checked.set(value);
    this.viewChanged.emit(value as 'padrao' | 'graficos');
  }

  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update((value) => !value);
  }

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update((value) => !value);
  }
}
