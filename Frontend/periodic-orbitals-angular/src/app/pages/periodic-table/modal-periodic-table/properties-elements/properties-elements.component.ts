import { Component, Inject } from '@angular/core';
import { ElectronDistribution } from './electron-distribution/electron-distribution.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-properties-elements',
  imports: [ElectronDistribution],
  templateUrl: './properties-elements.html',
  styleUrl: './properties-elements.scss'
})
export class PropertiesElements {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  

}
