import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { IElement } from '../../../../interfaces/IElement';
import { ORBITALS, type OrbitalDef, type OrbitalGroup } from './orbital.models';

interface OrbitalNlm {
  n: number;
  l: number;
  m: number;
}

const grupos: readonly OrbitalGroup[] = ['s', 'p', 'd', 'f'];
const sobrescritos = '⁰¹²³⁴⁵⁶⁷⁸⁹';

@Injectable({ providedIn: 'root' })
export class OrbitalSelectionService {
  private readonly http = inject(HttpClient);
  private lookupPromise?: Promise<Map<number, OrbitalNlm>>;

  async resolver(element: IElement | null): Promise<OrbitalDef | null> {
    const atomicNumber = element?.numeroAtomico;

    if (
      atomicNumber !== null &&
      atomicNumber !== undefined &&
      Number.isInteger(atomicNumber) &&
      atomicNumber > 0
    ) {
      const lookup = await this.carregarTabela();
      const entry = lookup.get(atomicNumber);
      if (entry && entry.l >= 0 && entry.l < grupos.length) {
        const group = grupos[entry.l];
        const orbital =
          ORBITALS.find(
            (candidate) =>
              candidate.n === entry.n &&
              candidate.l === entry.l &&
              candidate.m === entry.m &&
              candidate.g === group,
          ) ??
          ORBITALS.find(
            (candidate) =>
              candidate.n === entry.n &&
              candidate.l === entry.l &&
              candidate.g === group,
          );
        if (orbital) return orbital;
      }
    }

    return this.resolverConfiguracao(element?.configuracaoEletronica ?? '');
  }

  private carregarTabela(): Promise<Map<number, OrbitalNlm>> {
    this.lookupPromise ??= firstValueFrom(
      this.http.get('assets/tabelaNLM.csv', { responseType: 'text' }),
    )
      .then((csv) => {
        const lookup = new Map<number, OrbitalNlm>();
        for (const line of csv.split(/\r?\n/)) {
          const [zText, nText, lText, mText] = line
            .split(',')
            .map((value) => value.trim());
          const z = Number(zText);
          const n = Number(nText);
          const l = Number(lText);
          const m = Number(mText);
          if ([z, n, l, m].every(Number.isInteger)) lookup.set(z, { n, l, m });
        }
        return lookup;
      })
      .catch(() => new Map<number, OrbitalNlm>());

    return this.lookupPromise;
  }

  private resolverConfiguracao(configuration: string): OrbitalDef | null {
    const normalized = configuration
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (digit) => String(sobrescritos.indexOf(digit)))
      .replace(/\s+/g, ' ')
      .trim();
    const token = normalized
      .split(' ')
      .reverse()
      .find((part) => /^\d+[spdf]\d*$/.test(part));
    const match = token?.match(/^(\d+)([spdf])(\d*)$/);
    if (!match) return null;

    const n = Number(match[1]);
    const group = match[2] as OrbitalGroup;
    const l = grupos.indexOf(group);
    const electrons = match[3] ? Number(match[3]) : 1;
    if (n < 1 || electrons < 1) return null;

    return (
      ORBITALS.find(
        (orbital) => orbital.n === n && orbital.l === l && orbital.m === 0,
      ) ??
      ORBITALS.find((orbital) => orbital.n === n && orbital.l === l) ??
      null
    );
  }
}
