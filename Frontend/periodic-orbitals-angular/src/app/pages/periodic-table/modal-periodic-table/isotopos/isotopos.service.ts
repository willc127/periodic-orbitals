import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { DadosIsotoposElemento } from './isotopos.models';

@Injectable({ providedIn: 'root' })
export class IsotoposService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/elementos';

  // Cache por elemento — evita refetch ao trocar de aba/reabrir o modal para o mesmo elemento.
  private readonly cachePorElemento = new Map<number, Observable<DadosIsotoposElemento>>();

  buscarIsotopos(numeroAtomico: number): Observable<DadosIsotoposElemento> {
    let requisicao$ = this.cachePorElemento.get(numeroAtomico);

    if (!requisicao$) {
      requisicao$ = this.http
        .get<DadosIsotoposElemento>(`${this.baseUrl}/${numeroAtomico}/isotopos`)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
      this.cachePorElemento.set(numeroAtomico, requisicao$);
    }

    return requisicao$;
  }
}
