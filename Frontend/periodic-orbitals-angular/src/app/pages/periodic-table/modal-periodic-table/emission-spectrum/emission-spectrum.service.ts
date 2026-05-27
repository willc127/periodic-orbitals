import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ISpectrum } from '../../../../interfaces/ISpectra';

@Injectable({ providedIn: 'root' })
export class DadosElementosService {
  constructor(private http: HttpClient) {}

  obterDadosEspectro(symbol: string): Observable<ISpectrum> {
    return this.http.get<ISpectrum>(
      `http://localhost:8000/elements-data/${symbol}/spectral_lines`,
    );
  }
}
