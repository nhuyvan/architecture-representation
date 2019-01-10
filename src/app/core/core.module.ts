import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';
import { CoreComponent } from './core.component';
import { CanvasModule } from '../canvas/canvas.module';
import { CommandsModule } from '../commands/commands.module';

@NgModule({
  declarations: [CoreComponent],
  imports: [
    CommonModule,
    CanvasModule,
    SharedModule,
    CommandsModule
  ],
  exports: [CoreComponent]
})
export class CoreModule { }
