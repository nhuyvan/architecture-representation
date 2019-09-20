import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { TooltipComponent } from './tooltip/tooltip.component';
import { TooltipDirective } from './tooltip/tooltip.directive';
import { AttributeEditorComponent } from './attribute-editor/attribute-editor.component';
import { FilePickerComponent } from './file-picker/file-picker.component';
import { GraphModelDetailsComponent } from './graph-model/graph-model-details/graph-model-details.component';
import { AlertComponent } from './alert/alert.component';

@NgModule({
  declarations: [
    TooltipComponent,
    TooltipDirective,
    AttributeEditorComponent,
    FilePickerComponent,
    GraphModelDetailsComponent,
    AlertComponent
  ],
  exports: [
    MatButtonModule,
    TooltipDirective,
    MatDialogModule,
    MatIconModule,
    FilePickerComponent,
    GraphModelDetailsComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  entryComponents: [
    TooltipComponent,
    AttributeEditorComponent,
    AlertComponent
  ]
})
export class SharedModule { }
