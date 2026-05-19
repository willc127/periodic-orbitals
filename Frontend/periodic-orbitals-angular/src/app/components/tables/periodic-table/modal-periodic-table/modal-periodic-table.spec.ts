import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPeriodicTable } from './modal-periodic-table';

describe('ModalPeriodicTable', () => {
  let component: ModalPeriodicTable;
  let fixture: ComponentFixture<ModalPeriodicTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPeriodicTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPeriodicTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
