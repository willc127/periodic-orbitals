// tipo do elemento químico
export type Chemical = [string, string, string, number];

// dados de elementos
export const chemicals: Chemical[] = [
  ['H', 'Hydrogenium', 'Hydrogen', 1],
  ['He', 'Helium', 'Helium', 2],
  ['Li', 'Lithium', 'Lithium', 3],
  // Adicione outros elementos aqui
];

// cores correspondentes ao índice do último valor de Chemical
export const chemicalColors: Record<number, string> = {
  0: '#FFFFFF', // H
  1: '#FFD700', // He
  2: '#C0C0C0', // Li
  // Adicione cores correspondentes
};
