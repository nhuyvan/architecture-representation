import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Attribute } from './Attribute';

@Component({
  selector: 'mapper-attribute-editor',
  templateUrl: './attribute-editor.component.html',
  styleUrls: ['./attribute-editor.component.scss']
})
export class AttributeEditorComponent {

  form: FormGroup;
  attributes: FormArray;

  constructor(@Inject(MAT_DIALOG_DATA) readonly initialAttributes: Attribute[], private _fb: FormBuilder) {
    this.attributes = _fb.array(initialAttributes.map(attr => this._constructFormGroupForAttribute(attr)));
    this.form = _fb.group({ attributes: this.attributes });
  }

  addNewAttribute() {
    this.attributes.push(this._constructFormGroupForAttribute({ name: '', value: '' }));
  }

  removeAttribute(index: number) {
    this.attributes.removeAt(index);
  }

  private _constructFormGroupForAttribute(attr: Attribute) {
    return this._fb.group({
      name: this._fb.control(attr.name, Validators.required),
      value: this._fb.control(attr.value, Validators.required)
    });
  }

  isAttributeNameReadonly(attributeIndex: number) {
    return this.initialAttributes[attributeIndex] && this.initialAttributes[attributeIndex].readonly === true;
  }
}
