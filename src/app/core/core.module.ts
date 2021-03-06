import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';
import { CoreComponent } from './core.component';
import { GraphModule } from '../graph/graph.module';
import { CommandsModule } from '../commands/commands.module';
import { GraphModelComparatorModule } from '../graph-model-comparator/graph-model-comparator.module';

@NgModule({
  declarations: [CoreComponent],
  imports: [
    CommonModule,
    GraphModule,
    SharedModule,
    CommandsModule,
    GraphModelComparatorModule
  ],
  exports: [CoreComponent]
})
export class CoreModule { }
