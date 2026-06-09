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
  selector: 'app-button-toggle-modal',
  imports: [MatButtonToggleModule, MatCheckboxModule],
  templateUrl: './button-toggle-modal.html',
  styleUrl: './button-toggle-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ButtonToggleModal {
  checked = signal('padrao');
  checkedChange = output<string>();
  hideSingleSelectionIndicator = signal(false);
  hideMultipleSelectionIndicator = signal(false);

  onCheckedChange(newValue: string) {
    this.checked.set(newValue);
    this.checkedChange.emit(newValue);
  }

  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update((value) => !value);
  }

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update((value) => !value);
  }
}
