import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';
import { CommandsComponent } from './commands.component';
import { CommandComponent } from './views/command/command.component';

@NgModule({
  declarations: [CommandsComponent, CommandComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [CommandsComponent]
})
export class CommandsModule { }
