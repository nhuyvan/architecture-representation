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
  clicked = new EventEmitter<boolean>();

  constructor(private _tooltipService: TooltipService) { }

  ngOnInit() {
  }

  click() {
    this._tooltipService.hide();
    this.clicked.next();
  }

}
