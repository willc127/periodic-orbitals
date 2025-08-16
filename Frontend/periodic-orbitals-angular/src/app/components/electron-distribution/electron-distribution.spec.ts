import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronDistribution } from './electron-distribution';

describe('ElectronDistribution', () => {
  let component: ElectronDistribution;
  let fixture: ComponentFixture<ElectronDistribution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectronDistribution]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectronDistribution);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
