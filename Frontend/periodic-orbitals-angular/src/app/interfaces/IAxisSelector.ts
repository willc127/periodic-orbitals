export interface ElementProperty {
  id: string;
  label: string;
  unit?: string;
}

export interface AxisSelection {
  x: ElementProperty | null;
  y: ElementProperty[];
}

export interface PlotRequest {
  x: string;
  y: string[];   // múltiplas séries no eixo Y
}
