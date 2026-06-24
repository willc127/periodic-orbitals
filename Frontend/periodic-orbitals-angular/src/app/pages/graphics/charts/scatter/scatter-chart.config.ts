// ─── Config completa (usada pelo ScatterChart para cor, pointStyle etc.) ───
export const SERIES_CONFIG = [
  {
    id: 'atomic_number',
    label: 'Número atômico',
    unit: '',
    color: '#378ADD',
    pointStyle: 'rect',
  },
  {
    id: 'atomic_weight',
    label: 'Massa atômica',
    unit: 'u',
    color: '#7F77DD',
    pointStyle: 'circle',
  },
  {
    id: 'en_pauling',
    label: 'Eletronegatividade',
    unit: '',
    color: '#D85A30',
    pointStyle: 'triangle',
  },
  {
    id: 'atomic_radius',
    label: 'Raio atômico',
    unit: 'pm',
    color: '#1D9E75',
    pointStyle: 'triangle',
  },
  {
    id: 'density',
    label: 'Densidade',
    unit: 'g/cm³',
    color: '#BA7517',
    pointStyle: 'rect',
  },
  {
    id: 'boiling_point',
    label: 'Ponto de ebulição',
    unit: 'K',
    color: '#9FE1CB',
    pointStyle: 'circle',
  },
  {
    id: 'melting_point',
    label: 'Ponto de fusão',
    unit: 'K',
    color: '#FAC775',
    pointStyle: 'circle',
  },
  {
    id: 'thermal_conductivity',
    label: 'Condutividade térmica',
    unit: 'W/m·K',
    color: '#D4537E',
    pointStyle: 'circle',
  },
  {
    id: 'specific_heat_capacity',
    label: 'Calor específico',
    unit: 'J/g·K',
    color: '#AFA9EC',
    pointStyle: 'circle',
  },
  {
    id: 'evaporation_heat',
    label: 'Calor de evaporação',
    unit: 'kJ/mol',
    color: '#F28B30',
    pointStyle: 'rect',
  },
  {
    id: 'fusion_heat',
    label: 'Calor de fusão',
    unit: 'kJ/mol',
    color: '#6EC6A0',
    pointStyle: 'circle',
  },
  {
    id: 'abundance_crust',
    label: 'Abundância (crosta)',
    unit: 'mg/kg',
    color: '#C8A2C8',
    pointStyle: 'triangle',
  },
  {
    id: 'abundance_sea',
    label: 'Abundância (mar)',
    unit: 'mg/L',
    color: '#4DA6FF',
    pointStyle: 'rect',
  },
  {
    id: 'period',
    label: 'Período',
    unit: '',
    color: '#4DA6FF',
    pointStyle: 'rect',
  },
  {
    id: 'group_id',
    label: 'Família',
    unit: '',
    color: '#4DA6FF',
    pointStyle: 'rect',
  },
  {
    id: 'is_radioactive',
    label: 'Radioativo',
    unit: '',
    color: '#6eff4d',
    pointStyle: 'circle',
  },
] as const;

export type SeriesId = (typeof SERIES_CONFIG)[number]['id'];

export const ELEMENT_PROPERTIES = SERIES_CONFIG.map(({ id, label, unit }) => ({
  id,
  label,
  ...(unit ? { unit } : {}), // omite `unit` quando vazio
}));

export type ElementProperty = (typeof ELEMENT_PROPERTIES)[number];
