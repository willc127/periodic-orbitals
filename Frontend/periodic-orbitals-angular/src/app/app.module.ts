import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app';
import { PeriodicTable } from './components/tables/periodic-table/periodic-table';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule, // ← habilita o HttpClient em toda a aplicação
    MatDialogModule,
    BrowserAnimationsModule,
    AppComponent,
    PeriodicTable,
  ],
  providers: [], // serviços globais (se houver)
})
export class AppModule {}
