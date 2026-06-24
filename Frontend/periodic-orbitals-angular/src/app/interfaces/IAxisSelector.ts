export interface ElementProperty {
  id: string;
  label: string;
  unit?: string;
}

export interface PlotRequest {
  x: string;
  y: string[];
}