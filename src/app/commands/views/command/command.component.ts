import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { TooltipService } from '@shared/views/tooltip/tooltip.service';

@Component({
  selector: 'mapper-command',
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.scss']
})
export class CommandComponent implements OnInit {

  @Input()
  icon = '';

  @Input()
  tooltip = '';

  @Output()
  toggled = new EventEmitter<boolean>();

  isOn = true;

  constructor(private _tooltipService: TooltipService) { }

  ngOnInit() {
  }

  toggle() {
    this._tooltipService.hide();
    this.toggled.next(this.isOn);
    this.isOn = !this.isOn;
  }

}
