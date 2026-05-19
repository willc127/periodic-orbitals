// dados.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Element } from '../../../interfaces/elemento';

@Injectable({ providedIn: 'root' })
export class DadosElementosService {
  private apiUrl = 'http://localhost:8000/elements-data';

  constructor(private http: HttpClient) {}

  obterDados(): Observable<Element[]> {
    return this.http.get<Element[]>(this.apiUrl);
  }
}
