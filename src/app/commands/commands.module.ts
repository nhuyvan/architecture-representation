import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';
import { CommandsComponent } from './commands.component';

@NgModule({
  declarations: [CommandsComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [CommandsComponent]
})
export class CommandsModule { }
