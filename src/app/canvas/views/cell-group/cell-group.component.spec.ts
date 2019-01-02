import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CellGroupComponent } from './cell-group.component';

describe('CellGroupComponent', () => {
  let component: CellGroupComponent;
  let fixture: ComponentFixture<CellGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CellGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CellGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
