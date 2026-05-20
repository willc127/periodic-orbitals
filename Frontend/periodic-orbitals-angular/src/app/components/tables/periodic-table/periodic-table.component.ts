import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Element } from '../../../interfaces/elemento';
import { CommonModule } from '@angular/common';
import { DadosElementosService } from './periodic-table.service';
import { ModalPeriodicTable } from './modal-periodic-table/modal-periodic-table.component';

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './periodic-table.html',
  styleUrls: ['./periodic-table.scss'],
})
export class PeriodicTable implements OnInit {
  elements: Element[] = [];

  constructor(
    private elementService: DadosElementosService,
    private modal: MatDialog,
  ) {}

  // Função de mapeamento: recebe array bruto e retorna array formatado
  private mapearDados(dados: any[]): Element[] {
    return dados.map((item) => ({
      simbolo: item.symbol,
      nome: item.name,
      numeroAtomico: item.atomic_number,
      massaAtomica: item.atomic_weight,
      grupo: item.group_id,
      serie: item.type,
      periodo: item.period,
      configuracaoEletronica: item.electronic_configuration,
      descricao: item.description,
      tipo: item.type,
      link: item.link,
    }));
  }

  carregarDados(): void {
    this.elementService.obterDados().subscribe((data: Element[]) => {
      this.elements = this.mapearDados(data);
      this.elements.push(this.bloco_vazio_lantanideo);
      this.elements.push(this.bloco_vazio_actinideo);
      console.log(this.elements);
    });
  }

  // Elementos "vazios" para preencher os blocos de lantanídeos e actinídeos
  private bloco_vazio_lantanideo: Element = {
    simbolo: 'La-Lu',
    nome: 'Lantanídeos',
    numeroAtomico: null,
    massaAtomica: 0,
    grupo: 3,
    serie: '',
    periodo: 6,
    configuracaoEletronica: '',
    tipo: 'Lanthanide',
  };
  private bloco_vazio_actinideo: Element = {
    simbolo: 'Ac-Lr',
    nome: 'Actinídeos',
    numeroAtomico: null,
    massaAtomica: 0,
    grupo: 3,
    serie: '',
    periodo: 7,
    configuracaoEletronica: '',
    tipo: 'Actinide',
  };

  abrirModal(element: Element): void {
    this.modal.open(ModalPeriodicTable, {
      data: element,
      panelClass: 'modal-periodic-table-panel',
      width: '1500px',
      height: '900px',
      maxWidth: '90vw',
      maxHeight: '90vh',
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }
}
