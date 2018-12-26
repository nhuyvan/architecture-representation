import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, HostListener } from '@angular/core';

import { CellAdded } from './models/CellAddedEvent';
import { Link } from './models/Link';
import { Column, ColumnId } from './models/Column';
import { Cell } from './models/Cell';
import { ColumnLayoutChange } from './models/ColumnLayoutChange';

@Component({
  selector: 'mapper-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CanvasComponent implements OnInit, AfterViewInit {

  columnWidth = 0;
  columnHeight = 0;
  spacingBetweenColumns = 0;
  existingLinks: Map<Cell, Link[]>;
  selectedCell: Cell;
  selectedLink: Link;
  readonly columns: Column = {
    element: null,
    property: null,
    quality: null
  };
  elementCellDeleted: Cell;
  propertyCellDeleted: Cell;
  qualityCellDeleted: Cell;

  @ViewChild('canvas')
  private _canvasRef: ElementRef<SVGSVGElement>;
  private _canvasRect: ClientRect;
  private _sourceCell: Cell;
  private _selectedCell: Cell;
  private _selectedLink: Link;

  constructor(private _changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // ExpressionChangedAfterItHasBeenCheckedError avoidance because this is ngAfterViewInit
    setTimeout(() => {
      this._canvasRect = this._canvasRef.nativeElement.getBoundingClientRect();
      // 12.5% each
      this.spacingBetweenColumns = this._canvasRect.width * 12.5 / 100;
      // 25% each
      this.columnWidth = this._canvasRect.width * 25 / 100;
      this.columnHeight = this._canvasRect.height;
      this._changeDetector.markForCheck();
    }, 1000)
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      if (this._selectedCell) {
        switch (this._selectedCell.dataset.columnPrefix) {
          case 'element':
            this.elementCellDeleted = this._selectedCell;
            break;
          case 'property':
            this.propertyCellDeleted = this._selectedCell;
            break;
          case 'quality':
            this.qualityCellDeleted = this._selectedCell;
        }
        this._deleteCell();
        this._adjustAllLinks();
      }
      else if (this._selectedLink) {
        this._deleteLink(this._selectedLink.source);
        this._adjustAllLinks();
      }
    }
  }

  private _deleteCell() {
    this.columns[this._selectedCell.dataset.columnPrefix].delete(this._selectedCell);
    this._deleteLink(this._selectedCell);
    this.existingLinks.forEach(links => {
      for (const link of links)
        if (link.target === this._selectedCell)
          this._deleteLink(link.source);
    });
    this._selectedCell = null;
    this.selectedCell = null;
    this._sourceCell = null;
  }

  private _deleteLink(source: Cell) {
    this.existingLinks.delete(source);
    this._selectedLink = null;
    this.selectedLink = null;
  }

  onColumnLayoutChanged(layoutChange: ColumnLayoutChange, columnId: ColumnId) {
    this.columns[columnId] = layoutChange.cellsInColumn;
    this._adjustAllLinks();
    this._resizeCanvasIfCellOverflows(layoutChange.cellsInColumn.get(layoutChange.lastCellInColumn), layoutChange.columnHeight);
  }

  showConnectionsForSelectedComponent(state: boolean) {
    if (state) {
      this.selectedCell = this._selectedCell;
      this.selectedLink = this._selectedLink;
    }
    else {
      this.selectedCell = null;
      this.selectedLink = null;
    }
  }

  onLinkSelected(link: Link) {
    this._selectedLink = link;
    this._selectedCell = null;
  }

  onCellAdded(event: CellAdded, columnId: ColumnId) {
    this._resizeCanvasIfCellOverflows(this.columns[columnId].get(event.cell));
    this._adjustAllLinks();
  }

  private _resizeCanvasIfCellOverflows(cellGeometry: ClientRect, newColumnHeight?: number) {
    if (cellGeometry.bottom > this._canvasRect.height) {
      this._canvasRef.nativeElement.style.height = this._canvasRect.height
        + (cellGeometry.bottom - this._canvasRect.bottom) + 5
        + (document.documentElement.scrollTop || document.body.scrollTop)
        + 'px';
      this._canvasRect = this._canvasRef.nativeElement.getBoundingClientRect();
      this.columnHeight = this._canvasRect.height;
    }
    else if (newColumnHeight) {
      this._canvasRef.nativeElement.style.height = newColumnHeight + 'px';
      this.columnHeight = newColumnHeight;
    }
  }

  private _adjustAllLinks() {
    this.existingLinks = new Map<Cell, Link[]>(this.existingLinks);
  }

  onElementCellClicked(cell: Cell) {
    if (this._sourceCell === cell)
      this._sourceCell = null;
    else
      this._sourceCell = cell;
    this._selectedCell = this._sourceCell || null;
    this._selectedLink = null;
  }

  onPropertyCellClicked(cell: Cell) {
    if (cell === null || cell === this._sourceCell) {
      this._sourceCell = null;
      this._selectedCell = null;
    }
    else if (this._sourceCell && !this._sourceCell.id.startsWith('property')) {
      this._addNewLink({
        source: this._sourceCell,
        target: cell
      });
      this._sourceCell = null;
      this._selectedCell = null;
      this._adjustAllLinks();
    }
    else {
      this._sourceCell = cell;
      this._selectedCell = this._sourceCell;
    }
    this._selectedLink = null;
  }

  onQualityCellClicked(cell: Cell) {
    if (this._sourceCell && !this._sourceCell.id.startsWith('element')) {
      this._addNewLink({
        source: this._sourceCell,
        target: cell
      });
      this._adjustAllLinks();
    }
    this._selectedCell = !this._sourceCell ? cell : null;
    this._selectedLink = null;
    this._sourceCell = null;
  }

  private _addNewLink(link: Link) {
    if (!this.existingLinks.has(link.source))
      this.existingLinks.set(link.source, []);
    this.existingLinks.get(link.source).push(link);
  }

}
