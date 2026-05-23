import {
  ChangeDetectionStrategy,
  Component,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-button-toggle',
  imports: [MatButtonToggleModule, MatCheckboxModule],
  templateUrl: './button-toggle.html',
  styleUrl: './button-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ButtonToggle {
  hideSingleSelectionIndicator = signal(false);
  hideMultipleSelectionIndicator = signal(false);

  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update((value) => !value);
  }

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update((value) => !value);
  }
}
