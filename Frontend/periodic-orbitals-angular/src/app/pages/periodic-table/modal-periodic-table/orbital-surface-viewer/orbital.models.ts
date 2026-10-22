export type OrbitalGroup = 's' | 'p' | 'd' | 'f';

export interface OrbitalDef {
  n: number;
  l: number;
  m: number;
  g: OrbitalGroup;
}

const grupos: readonly OrbitalGroup[] = ['s', 'p', 'd', 'f'];
const orbitais: OrbitalDef[] = [];

for (let n = 1; n <= 7; n++) {
  for (let l = 0; l <= Math.min(n - 1, 3); l++) {
    for (let m = -l; m <= l; m++) {
      orbitais.push({ n, l, m, g: grupos[l] });
    }
  }
}

export const ORBITALS: readonly OrbitalDef[] = orbitais;
