import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { TooltipComponent } from './tooltip/tooltip.component';
import { TooltipDirective } from './tooltip/tooltip.directive';
import { AttributeEditorComponent } from './attribute-editor/attribute-editor.component';
import { FilePickerComponent } from './file-picker/file-picker.component';

@NgModule({
  declarations: [TooltipComponent, TooltipDirective, AttributeEditorComponent, FilePickerComponent],
  exports: [MatButtonModule, TooltipDirective, MatDialogModule, MatIconModule, FilePickerComponent],
  imports: [
    CommonModule, MatButtonModule, MatDialogModule, MatIconModule, ReactiveFormsModule, MatInputModule,
    MatFormFieldModule
  ],
  entryComponents: [TooltipComponent, AttributeEditorComponent]
})
export class SharedModule { }
