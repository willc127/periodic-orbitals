import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-periodic-table',
  standalone: true,
  templateUrl: './modal-periodic-table.html',
  styleUrls: ['./modal-periodic-table.scss'],
})
export class ModalPeriodicTable {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
