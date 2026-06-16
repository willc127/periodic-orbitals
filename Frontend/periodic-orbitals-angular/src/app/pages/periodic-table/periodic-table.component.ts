import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IElement } from '../../interfaces/IElement';
import { CommonModule } from '@angular/common';
import { DadosElementosService } from './periodic-table.service';
import { ModalPeriodicTable } from './modal-periodic-table/modal-periodic-table.component';
import { SelectorsComponent } from './selectors/selectors.component';

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [CommonModule, SelectorsComponent],
  templateUrl: './periodic-table.html',
  styleUrls: ['./periodic-table.scss'],
})
export class PeriodicTable implements OnInit {
  elements: IElement[] = [];

  constructor(
    private elementService: DadosElementosService,
    private modal: MatDialog,
  ) {}

  // Função de mapeamento: recebe array bruto e retorna array formatado
  private mapearDados(dados: any[]): IElement[] {
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
      abundanciaCrosta: item.abundance_crust,
      abundanciaMar: item.abundance_sea,
      densidade: item.density,
      raioAtomico: item.atomic_radius,
      usos: item.uses,
      eletronegatividade: item.en_pauling,
      condutividadeTermica: item.thermal_conductivity,
      capacidadeCalorifica: item.specific_heat_capacity,
      capacidadeCalorificaMolar: item.molar_heat_capacity,
      radioativo: item.is_radioactive,
      classeGeoquimica: item.geochemical_class,
      calorEvaporacao: item.evaporation_heat,
      calorFusao: item.fusion_heat,
      CAS: item.cas,
      temperaturaFusao: item.melting_point,
      temperaturaEbulicao: item.boiling_point,
      temperaturaCritica: item.critical_temperature,
      pressaoCritica: item.critical_pressure,
      fontes: item.sources,
      tipo: item.type,
      link: item.link,
      link_nist: item.link_nist,
      spectral_lines: item.spectral_lines,
    }));
  }

  carregarDados(): void {
    this.elementService.obterDados().subscribe((data: IElement[]) => {
      this.elements = this.mapearDados(data);
      this.elements.push(this.bloco_vazio_lantanideo);
      this.elements.push(this.bloco_vazio_actinideo);
    });
  }

  // Elementos "vazios" para preencher os blocos de lantanídeos e actinídeos
  private bloco_vazio_lantanideo: IElement = {
    simbolo: 'La-Lu',
    nome: 'Lantanídeos',
    numeroAtomico: null,
    massaAtomica: 0,
    grupo: 3,
    serie: '',
    periodo: 6,
    configuracaoEletronica: '',
    descricao: 'Blocos de lantanídeos',
    abundanciaCrosta: 0,
    abundanciaMar: 0,
    densidade: 0,
    raioAtomico: 0,
    usos: '',
    eletronegatividade: 0,
    condutividadeTermica: 0,
    capacidadeCalorifica: 0,
    capacidadeCalorificaMolar: 0,
    radioativo: false,
    classeGeoquimica: '',
    calorEvaporacao: 0,
    calorFusao: 0,
    CAS: '',
    temperaturaFusao: 0,
    temperaturaEbulicao: 0,
    temperaturaCritica: 0,
    pressaoCritica: 0,
    fontes: '',
    tipo: 'Lanthanide',
  };
  private bloco_vazio_actinideo: IElement = {
    simbolo: 'Ac-Lr',
    nome: 'Actinídeos',
    numeroAtomico: null,
    massaAtomica: 0,
    grupo: 3,
    serie: '',
    periodo: 7,
    configuracaoEletronica: '',
    descricao: 'Blocos de actinídeos',
    abundanciaCrosta: 0,
    abundanciaMar: 0,
    densidade: 0,
    raioAtomico: 0,
    usos: '',
    eletronegatividade: 0,
    condutividadeTermica: 0,
    capacidadeCalorifica: 0,
    capacidadeCalorificaMolar: 0,
    radioativo: false,
    classeGeoquimica: '',
    calorEvaporacao: 0,
    calorFusao: 0,
    CAS: '',
    temperaturaFusao: 0,
    temperaturaEbulicao: 0,
    temperaturaCritica: 0,
    pressaoCritica: 0,
    fontes: '',
    tipo: 'Actinide',
  };

  abrirModal(element: IElement): void {
    this.modal.open(ModalPeriodicTable, {
      data: element,
      panelClass: 'modal-periodic-table-panel',
      width: '1500px',
      height: '1000px',
      maxWidth: '90vw',
      maxHeight: '90vh',
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }
}
