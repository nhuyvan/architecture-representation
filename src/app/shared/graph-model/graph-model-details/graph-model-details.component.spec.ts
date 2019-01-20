import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphModelDetailsComponent } from './graph-model-details.component';

describe('GraphModelDetailsComponent', () => {
  let component: GraphModelDetailsComponent;
  let fixture: ComponentFixture<GraphModelDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphModelDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphModelDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
