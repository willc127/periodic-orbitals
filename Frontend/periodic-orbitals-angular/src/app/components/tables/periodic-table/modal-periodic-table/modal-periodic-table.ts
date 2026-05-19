import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-periodic-table',
  imports: [],
  templateUrl: './modal-periodic-table.html',
  styleUrl: './modal-periodic-table.scss'
})
export class ModalPeriodicTable {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

}
