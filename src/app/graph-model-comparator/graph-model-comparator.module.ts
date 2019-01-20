import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GraphModelComparatorComponent } from './graph-model-comparator.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [GraphModelComparatorComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  entryComponents: [GraphModelComparatorComponent]
})
export class GraphModelComparatorModule { }
