import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { PeriodicTable } from './pages/periodic-table/periodic-table.component';
import { AxisSelectorComponent } from './pages/graphics/axis-selector/axis-selector.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule, // ← habilita o HttpClient em toda a aplicação
    MatDialogModule,
    BrowserAnimationsModule,
    AppComponent,
    PeriodicTable,
    AxisSelectorComponent,
  ],
  providers: [], // serviços globais (se houver)
})
export class AppModule {}
