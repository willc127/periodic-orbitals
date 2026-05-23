import { Component } from '@angular/core';

@Component({
  selector: 'app-selectors',
  imports: [],
  templateUrl: './selectors.component.html',
  styleUrl: './selectors.component.scss',
})
export class SelectorsComponent {

  listaEsquerda = [
    { tipo: 'Metal alcalino', cor: '#FF8439' },
    { tipo: 'Metal alcalino-terroso', cor: '#FFD400' },
    { tipo: 'Metal de transição', cor: '#354782' },
    { tipo: 'Lantanídeos', cor: '#AA6B30' },
    { tipo: 'Actinídeos', cor: '#ACFF8B' },
  ];
  
  listaDireita = [
    { tipo: 'Semimetal', cor: '#1F7063' },
    { tipo: 'Metal de pós-transição', cor: '#3DDED6' },
    { tipo: 'Não-metal', cor: '#888529' },
    { tipo: 'Halogênio', cor: '#6D3C9F' },
    { tipo: 'Gás nobre', cor: '#FF00AA' },
  ];
}
