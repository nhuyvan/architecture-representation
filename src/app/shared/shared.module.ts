import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { RippleDirective } from './views/ripple.directive';
import { TooltipComponent } from './views/tooltip/tooltip.component';
import { TooltipDirective } from './views/tooltip/tooltip.directive';

@NgModule({
  declarations: [RippleDirective, TooltipComponent, TooltipDirective],
  exports: [MatButtonModule, RippleDirective, TooltipDirective, MatDialogModule, MatIconModule],
  entryComponents: [TooltipComponent]
})
export class SharedModule { }
