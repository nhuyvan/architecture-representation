import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';
import { CoreComponent } from './core.component';
import { CanvasModule } from '../canvas/canvas.module';

@NgModule({
  declarations: [CoreComponent],
  imports: [
    CommonModule,
    CanvasModule,
    SharedModule
  ],
  exports: [CoreComponent]
})
export class CoreModule { }
