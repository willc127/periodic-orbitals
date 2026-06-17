import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-description',
  imports: [],
  templateUrl: './description.html',
  styleUrl: './description.scss'
})
export class Description {
  readonly data = inject(MAT_DIALOG_DATA);

}
