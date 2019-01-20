import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphModelComparatorComponent } from './graph-model-comparator.component';

describe('GraphModelComparatorComponent', () => {
  let component: GraphModelComparatorComponent;
  let fixture: ComponentFixture<GraphModelComparatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphModelComparatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphModelComparatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
