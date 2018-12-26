import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreComponent } from './core.component';
import { CanvasModule } from '../canvas/canvas.module';

@NgModule({
  declarations: [CoreComponent],
  imports: [
    CommonModule,
    CanvasModule
  ],
  exports: [CoreComponent]
})
export class CoreModule { }
