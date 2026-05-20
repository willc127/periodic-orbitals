import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicTable } from './periodic-table.component';

describe('PeriodicTable', () => {
  let component: PeriodicTable;
  let fixture: ComponentFixture<PeriodicTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodicTable],
    }).compileComponents();

    fixture = TestBed.createComponent(PeriodicTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
