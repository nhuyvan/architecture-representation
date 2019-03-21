import {
  Component, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, OnInit, Host,
  ViewEncapsulation, Output, EventEmitter
} from '@angular/core';
import { zeros, Matrix, multiply, subtract, matrix, transpose, divide, hypot, dot, sum, diag, ones } from 'mathjs';
import { MatDialog } from '@angular/material/dialog';
import { svgAsPngUri, download } from 'save-svg-as-png';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { filter, map } from 'rxjs/operators';

import { MatricesComponent } from './views/matrices/matrices.component';
import { Link } from './models/Link';
import { Column, ColumnId } from './models/Column';
import { Cell } from './models/Cell';
import { ColumnLayoutChange, ColumnLayoutChangeType } from './models/ColumnLayoutChange';
import { CellSelectionEvent, CellSelectionEventType } from './models/CellSelectionEvent';
import { ColumnLayoutChangeService } from './services/column-layout-change.service';
import { CellGroup } from './models/CellGroup';
import { CommandService, CommandAction, Command } from '@shared/command';
import { MatrixEditorComponent } from './views/matrix-editor/matrix-editor.component';
import { GraphModel, LinkGraphModel } from '@shared/graph-model';
import { Attribute, AttributeEditorComponent } from '@shared/attribute-editor';
import { FilePickerService } from '@shared/file-picker';
import { GraphModelChangeService } from './services/graph-model-change.service';
import { GraphModelChangeType, GraphModelChange } from './models/GraphModelChangeType';
import { WindowResizeWatcherService } from './services/window-resize-watcher.service';

@Component({
  selector: 'mapper-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'frame'
  },
  encapsulation: ViewEncapsulation.None,
  providers: [GraphModelChangeService]
})
export class GraphComponent implements AfterViewInit, OnInit {

  private static readonly _MODEL_VERSION = '2.0';

  @Output()
  modelChanged = new EventEmitter<GraphModel>();

  columnWidth = 0;
  columnHeight = 0;
  readonly headerHeight = 100;
  spacingBetweenColumns = 0;
  linkTable = new Map<Cell, Array<Link>>();
  selectedLink: Link;
  readonly columns: Column = {
    element: [],
    property: [],
    quality: []
  };
  readonly cellGroups = {
    element: [new CellGroup(0, false)],
    property: [new CellGroup(0, false)],
    quality: [new CellGroup(0, false)]
  };
  selectedCells: Cell[] = [];
  showAssociations = false;

  private _canvasContainer: SVGSVGElement;
  private _canvasContainerRect: ClientRect;
  private _canvasInitialHeight = 0;
  private _Dp = matrix(zeros(1, 1));
  private _Dq = matrix(zeros(1, 1));
  private _graphModel: GraphModel = null;

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _columnLayoutChange: ColumnLayoutChangeService,
    private _commandService: CommandService,
    @Host() private readonly _hostElement: ElementRef<HTMLElement>,
    private _matDialog: MatDialog,
    private _filePicker: FilePickerService,
    private _graphModeChange: GraphModelChangeService,
    private _windowResizeWatcher: WindowResizeWatcherService
  ) {
  }

  ngAfterViewInit() {
    // ExpressionChangedAfterItHasBeenCheckedError avoidance because this is ngAfterViewInit
    setTimeout(() => {
      this._doLayout();
      this._changeDetector.markForCheck();
    }, 1000);
  }

  private _doLayout() {
    this._canvasContainer = this._hostElement.nativeElement.firstElementChild as SVGSVGElement;
    this._canvasContainerRect = this._canvasContainer.getBoundingClientRect();
    // 12.5% each
    this.spacingBetweenColumns = this._canvasContainerRect.width * 12.5 / 100;
    // 25% each
    this.columnWidth = this._canvasContainerRect.width * 25 / 100;
    this.columnHeight = this._canvasContainerRect.height - this.headerHeight;
    this._canvasInitialHeight = this.columnHeight;
  }

  ngOnInit() {
    this._columnLayoutChange.observe()
      .subscribe({
        next: layoutChange => this._onColumnLayoutChanged(layoutChange)
      });

    this._graphModeChange.observe()
      .subscribe({
        next: change => this._onGraphModelChanged(change)
      });

    this._commandService.observe()
      .subscribe({
        next: (command: Command) => this._onCommandSelected(command)
      });

    this._windowResizeWatcher.observe()
      .subscribe({
        next: () => {
          this._doLayout();
          this._notifyChanges('element');
          this._notifyChanges('property');
          this._notifyChanges('quality');
          this._changeDetector.detectChanges();
        }
      });
  }

  private _onGraphModelChanged(change: GraphModelChange) {
    switch (change.type) {
      case GraphModelChangeType.QUALITY_WEIGHT_UPDATED:
        this._qualityWeightUpdated(change);
        break;
      case GraphModelChangeType.CELL_TEXT_UPDATED:
        this._cellTextUpdated(change);
        break;
    }
  }

  private _qualityWeightUpdated(changeEvent: GraphModelChange) {
    changeEvent.payload.cell.weight = changeEvent.payload.weight;
    this._graphModel = this._constructGraphModel();
    this.modelChanged.emit(this._graphModel);
    this._filePicker.clearSelection();
  }

  private _cellTextUpdated(changeEvent: GraphModelChange) {
    changeEvent.payload.cell.text = changeEvent.payload.text;
    this._filePicker.clearSelection();
  }

  private _onCommandSelected(command: Command) {
    switch (command.action) {
      case CommandAction.TOGGLE_SHOW_ASSOCIATIONS:
        this._toggleAssociationsForSelectedComponents(!this.showAssociations);
        break;
      case CommandAction.GROUP_CELLS:
        this._groupSelectedCells();
        break;
      case CommandAction.UNGROUP_CELLS:
        this._ungroupSelectedCells();
        break;
      case CommandAction.SHOW_MATRICES:
        this._showMatrices();
        break;
      case CommandAction.TURN_CELL_ON:
        this._turnCellsOnOrOff(true);
        break;
      case CommandAction.TURN_CELL_OFF:
        this._turnCellsOnOrOff(false);
        break;
      case CommandAction.EXPORT_GRAPH_AS_PNG:
        this._exportGraphAsPng();
        break;
      case CommandAction.EDIT_Dp_DETRACTOR_MATRIX:
        this._filePicker.clearSelection();
        this._editDpMatrix();
        break;
      case CommandAction.EDIT_Dq_DETRACTOR_MATRIX:
        this._filePicker.clearSelection();
        this._editDqMatrix();
        break;
      case CommandAction.SAVE_GRAPH_MODEL:
        this._saveGraphModel();
        break;
      case CommandAction.IMPORT_GRAPH_MODEL:
        this._importGraphModel();
        break;
    }
  }


  private _toggleAssociationsForSelectedComponents(state: boolean) {
    this.showAssociations = state;
    this._changeDetector.detectChanges();
  }

  private _groupSelectedCells() {
    const cellsToGroup = this.selectedCells.filter(cell => cell.column === 'element');
    if (cellsToGroup.length > 0) {
      const newGroup = new CellGroup(this.cellGroups.element.length, true);
      newGroup.width = this.columnWidth;
      for (const elementCell of cellsToGroup) {
        elementCell.cellGroup.removeCell(elementCell);
        this._removeNonDefaultCellGroupIfEmpty(elementCell.cellGroup);
        newGroup.addCell(elementCell);
      }
      this._addNewCellGroup(newGroup);
      this._notifyChanges('element');
    }
  }

  private _addNewCellGroup(cellGroup: CellGroup) {
    const defaultGroup = this.cellGroups.element.pop();
    this.cellGroups.element = this.cellGroups.element.concat(cellGroup, defaultGroup);
    this._changeDetector.detectChanges();
  }

  private _ungroupSelectedCells(addToDefaultGroup = true) {
    for (const cellToUngroup of this.selectedCells) {
      cellToUngroup.cellGroup.removeCell(cellToUngroup);
      // Only remove the owning group if it is not the default group and empty
      this._removeNonDefaultCellGroupIfEmpty(cellToUngroup.cellGroup);
      if (addToDefaultGroup)
        this._addToDefaultCellGroup(cellToUngroup);
    }
    this._notifyChanges('element');
  }

  private _removeNonDefaultCellGroupIfEmpty(cellGroup: CellGroup) {
    if (this.cellGroups.element.length > 1 && cellGroup.size() === 0)
      this.cellGroups.element = this.cellGroups.element.filter(group => group !== cellGroup)
        .map((group, index) => {
          group.id = index;
          return group;
        });
  }

  private _showMatrices() {
    const matrices = this._computeMatrices();
    if (matrices)
      this._matDialog.open(MatricesComponent, {
        data: [
          { name: 'L', entries: matrices.L.toArray() },
          { name: 'Dp', entries: matrices.Dp.toArray() },
          { name: 'R', entries: matrices.R.toArray() },
          { name: 'Dq', entries: matrices.Dq.toArray() },
          { name: 'T', entries: matrices.T.toArray() },
          { name: 'r', entries: matrices.r.toArray() }
        ],
        autoFocus: false
      });
  }

  private _computeMatrices() {
    try {
      const L = zeros(this.columns.property.length, this.columns.element.length) as Matrix;
      const R = zeros(this.columns.quality.length, this.columns.property.length) as Matrix;
      this._Dp = this._Dp.resize([this.columns.property.length, this.columns.element.length], 0);
      // Dq has size of RL
      this._Dq = this._Dq.resize([this.columns.quality.length, this.columns.element.length], 0);
      this.linkTable.forEach(links => {
        for (const link of links) {
          switch (link.source.column) {
            case 'element':
              L.set([link.target.id, link.source.id], 1);
              this._Dp.set([link.target.id, link.source.id], 0);
              break;
            case 'property':
              R.set([link.target.id, link.source.id], 1);
              this._Dq.set([link.target.id, link.source.id], 0);
              break;
          }
        }
      });
      const e = matrix(this.columns.element.map(cell => cell.isOn ? 1 : 0));
      // q = [ R (L – Dp) – Dq ] e
      const q = multiply(subtract(multiply(R, subtract(L, this._Dp)), this._Dq), e) as Matrix;
      // r = Wq0 / |Wq0|
      const totalQualityWeight = sum(this.columns.quality.map(cell => cell.weight));
      const w = matrix(this.columns.quality.map(cell => cell.weight / totalQualityWeight));
      const q0 = matrix(ones(q.size()));
      const W = diag(w);
      const WTimesq0 = multiply(W, q0);
      const r = divide(WTimesq0, hypot(WTimesq0 as any)) as Matrix;

      // T = R (L - Dp) – Dq
      const T = subtract(multiply(R, subtract(L, this._Dp)), this._Dq) as Matrix;

      return { L, Dp: this._Dp, R, Dq: this._Dq, T, r, e, q };
    } catch (e) {
      console.warn(`[GraphComponent -> _computeMatrices] ${e.message}`);
      return null;
    }
  }

  private _computeAngle(q: Matrix, r: Matrix): string {
    // A(q,r) = <q,r> /(|q||r|)
    const angle = Math.acos(dot(q, r) / (hypot(q as any) * hypot(r as any))) * 180 / Math.PI;
    return angle ? angle.toFixed(2) + ' deg' : '';
  }

  private _computeStrength(q: Matrix, r: Matrix, e: Matrix): string {
    // S(q,r) = <q,r> / Transpose(e)e
    const strength = divide(dot(q, r), multiply(transpose(e), e)) as number;
    return strength ? strength.toFixed(2) : '';
  }

  private _turnCellsOnOrOff(onOrOff: boolean) {
    this.selectedCells.filter(selected => selected.column === 'element')
      .forEach(cell => cell.isOn = onOrOff);
    this._changeDetector.detectChanges();
  }

  private _exportGraphAsPng() {
    const graph = this._canvasContainer.cloneNode(true) as SVGElement;
    document.body.appendChild(graph);
    graph.querySelectorAll('.column-header__add-cell')
      .forEach(addButton => addButton.parentElement.removeChild(addButton));
    graph.querySelectorAll('*[data-selected]')
      .forEach(selected => selected.removeAttribute('data-selected'));
    svgAsPngUri(graph, {}, (uri: string) => {
      download(this._graphModel.attributes['Graph name'] || 'graph.png', uri);
      document.body.removeChild(graph);
    });
  }

  private _editDpMatrix() {
    this._Dp = this._Dp.resize([this.columns.property.length, this.columns.element.length], 0);
    this.linkTable.forEach(links => {
      for (const link of links)
        if (link.source.column === 'element')
          this._Dp.set([link.target.id, link.source.id], -1);
    });
    this._showMatrixEditor('Dp', this._Dp)
      .subscribe(resultingMatrix => {
        this._Dp = resultingMatrix;
        this._Dp.forEach((entry, index: any, Dp) => {
          if (entry === -1)
            Dp.set(index, 0);
        });
      });
  }

  private _editDqMatrix() {
    this._Dq = this._Dq.resize([this.columns.quality.length, this.columns.element.length], 0);
    this._showMatrixEditor('Dq', this._Dq)
      .subscribe(updatedMatrix => this._Dq = updatedMatrix);
  }

  private _showMatrixEditor(matrixName: string, inputMatrix: Matrix): Observable<Matrix> {
    this._unselectAllSelectedComponents();
    this._changeDetector.detectChanges();
    return this._matDialog.open(
      MatrixEditorComponent,
      {
        data: { matrixName, matrix: inputMatrix },
        disableClose: true,
        autoFocus: false
      })
      .afterClosed();
  }

  private _unselectAllSelectedComponents() {
    this.selectedCells = [];
    this.selectedLink = null;
  }

  private _saveGraphModel() {
    this._unselectAllSelectedComponents();
    const initialAttributes = [];
    if (!this._graphModel || !this._graphModel.attributes['Graph name'])
      initialAttributes.push(
        { name: 'Graph name', value: '' },
        { name: 'Date created', value: new DatePipe('en-US').transform(new Date(), 'MM/dd/yyyy, HH:mm:ss zzzz') }
      );
    else
      initialAttributes.push(
        ...Object.entries(this._graphModel.attributes)
          .map(([attrName, attrValue]) => ({ name: attrName, value: attrValue }))
          .sort((a, b) => {
            if (a.name === 'Graph name')
              return -1;
            if (b.name === 'Graph name')
              return 1;
            if (a.name === 'Date created')
              return -1;
            if (b.name === 'Date created')
              return 1;
            return -1;
          })
      );
    this._matDialog.open(AttributeEditorComponent, {
      data: initialAttributes,
      autoFocus: false
    })
      .afterClosed()
      .subscribe(attributes => {
        if (attributes.length > 0) {
          this._graphModel = this._constructGraphModel(true, attributes);
          const blob = new Blob([JSON.stringify(this._graphModel, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          download(`${this._graphModel.attributes['Graph name'] || 'graph-model'}.json`, url);
          URL.revokeObjectURL(url);
          this.modelChanged.emit(this._graphModel);
        }
      });
  }

  private _constructGraphModel(forStorage = false, attributes?: Attribute[]): GraphModel {
    const matrices = this._computeMatrices();
    if (matrices)
      return {
        ...Object.assign(
          forStorage
            ?
            {
              attributes: attributes.reduce((container, attr) => {
                container[attr.name] = attr.value;
                return container;
              }, {}),
              columns: Object.entries(this.columns)
                .reduce((container, [columnName, cells]) => {
                  container[columnName] = cells.map(cell => cell.constructCellGraphModel());
                  return container;
                }, { element: null, property: null, quality: null }),

              groups: Object.entries(this.cellGroups)
                .reduce((container, [columnName, groups]) => {
                  container[columnName] = groups.map(group => group.constructGroupGraphModel());
                  return container;
                }, { element: null, property: null, quality: null }),

              links: Array.from(this.linkTable.values())
                .reduce((container, links) => {
                  container = container.concat(links.map(link => link.constructLinkGraphModel()));
                  return container;
                }, [] as LinkGraphModel[])
            }
            :
            {
              attributes: (this._graphModel || { attributes: {} }).attributes,
              columns: null,
              groups: null,
              links: null
            }
        ),
        angle: this._computeAngle(matrices.q, matrices.r),
        strength: this._computeStrength(matrices.q, matrices.r, matrices.e),
        q: matrices.q.toArray() as number[],
        version: GraphComponent._MODEL_VERSION
      };
    return {
      attributes: attributes ? attributes.reduce((container, attr) => {
        container[attr.name] = attr.value;
        return container;
      }, {}) : {}
    } as GraphModel;
  }

  private _importGraphModel() {
    this._filePicker.open()
      .readFileAsJson<GraphModel>()
      .pipe(
        filter(graphModel => graphModel !== null),
        map(graphModel => 'version' in graphModel ? graphModel : this._convertGraphModelToNewerVersion(graphModel))
      )
      // .pipe(catchError(err => { console.log(err); return of(null); })) TODO: Show error dialog
      .subscribe({
        next: graphModel => {
          this._graphModel = graphModel;
          this._constructColumnsFromGraphModel(graphModel);
          this._constructCellGroupsFromGraphModel(graphModel);
          this._constructLinkTableFromGraphModel(graphModel);
          this._notifyChanges();
          this.modelChanged.emit(graphModel);
        }
      });
  }

  private _convertGraphModelToNewerVersion(graphModel: GraphModel) {
    for (const cellGraphModels of Object.values(graphModel.columns))
      for (const cellGraphModel of cellGraphModels) {
        delete cellGraphModel['top'];
        delete cellGraphModel['left'];
        delete cellGraphModel['width'];
        delete cellGraphModel['height'];
      }
    for (const groupGraphModels of Object.values(graphModel.groups))
      for (const group of groupGraphModels) {
        delete group['top'];
        delete group['left'];
        delete group['width'];
        delete group['height'];
      }
    graphModel.links = graphModel.links.reduce((accumulator, link: any) => {
      accumulator = accumulator.concat(
        link.targets.map(e => ({ ...e, sourceId: link.sourceId, sourceColumn: link.sourceColumn }))
      );
      return accumulator;
    }, []);
    graphModel.version = GraphComponent._MODEL_VERSION;
    return graphModel;
  }

  private _constructColumnsFromGraphModel(graphModel: GraphModel) {
    for (const [column, cellGraphModels] of Object.entries(graphModel.columns))
      this.columns[column] = cellGraphModels.map(Cell.fromCellGraphModel);
  }

  private _constructCellGroupsFromGraphModel(graphModel: GraphModel) {
    for (const [columnId, groups] of Object.entries(graphModel.groups)) {
      this.cellGroups[columnId] = groups.map(groupGraphModel => {
        const newCellGroup = new CellGroup(groupGraphModel.id, groupGraphModel.useDefaultSpacing);
        newCellGroup.width = this.columnWidth;
        for (const { id: cellId } of groupGraphModel.cells) {
          const cell = this.columns[columnId as ColumnId][cellId];
          newCellGroup.addCell(cell);
        }
        return newCellGroup;
      });
    }
  }

  private _constructLinkTableFromGraphModel(graphModel: GraphModel) {
    this.linkTable.clear();
    for (const linkGraphModel of graphModel.links) {
      const sourceCell = this.columns[linkGraphModel.sourceColumn as ColumnId][linkGraphModel.sourceId];
      const targetCell = this.columns[linkGraphModel.targetColumn as ColumnId][linkGraphModel.targetId];
      this._addNewLink(sourceCell, targetCell, linkGraphModel.weight);
    }
  }

  private _onColumnLayoutChanged(layoutChange: ColumnLayoutChange) {
    switch (layoutChange.type) {
      case ColumnLayoutChangeType.CELL_ADDED:
      case ColumnLayoutChangeType.CELL_HEIGHT_INCREASED:
        const cells = this.columns[layoutChange.trigger.column];
        if (layoutChange.type === ColumnLayoutChangeType.CELL_ADDED)
          this._expandCanvasIfCellOverflowsColumn(cells[cells.length - 1]);
        this._notifyChanges(
          layoutChange.type === ColumnLayoutChangeType.CELL_HEIGHT_INCREASED ? layoutChange.trigger.column : null
        );
        break;
      case ColumnLayoutChangeType.CELL_HEIGHT_DECREASED:
        this._shrinkCanvasIfTooMuchEmptyVerticalSpace();
        this._notifyChanges(layoutChange.trigger.column);
        break;
    }
    this.selectedCells = this.selectedCells.filter(selected => selected !== layoutChange.trigger);
  }

  private _expandCanvasIfCellOverflowsColumn(cell: Cell) {
    const difference = (cell.top + cell.height) - this.columnHeight;
    if (difference > 0) {
      this._canvasContainer.style.height = this._canvasContainerRect.height
        + difference + 5
        + this._hostElement.nativeElement.scrollTop
        + 'px';
      this._canvasContainerRect = this._canvasContainer.getBoundingClientRect();
      this.columnHeight = this._canvasContainerRect.height - this.headerHeight;
    }
  }

  private _shrinkCanvasIfTooMuchEmptyVerticalSpace() {
    const largestMinimumColumnHeight = Object.values(this.columns)
      .map(cells => this._calculateMinimumColumnHeight(cells))
      .reduce((largest, columnMinimumHeight) => Math.max(largest, columnMinimumHeight), 0);

    const emptyVerticalSpace = this.columnHeight - largestMinimumColumnHeight;
    // 10 is the padding between the last cell and the canvas bottom border
    if (emptyVerticalSpace > 10) {
      const adjustedHeight = Math.max(this.columnHeight - (emptyVerticalSpace - 10), this._canvasInitialHeight);
      this._canvasContainer.style.height = (adjustedHeight + this.headerHeight) + 'px';
      this.columnHeight = adjustedHeight;
      this._canvasContainerRect = this._canvasContainer.getBoundingClientRect();
    }
  }

  private _calculateMinimumColumnHeight(cells: Cell[]) {
    const minimumSpacingBetweenCells = 5;
    return this._sumCellHeights(cells) + minimumSpacingBetweenCells * (cells.length + 1);
  }

  private _sumCellHeights(cells: Cell[]) {
    return cells.reduce((accumulator, cell) => accumulator + cell.height, 0);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      if (this.selectedCells.length > 0) {
        this._deleteSelectedCells();
        this._ungroupSelectedCells(false);
        this.selectedCells = [];
        this._commandService.select(CommandAction.ACTIVATE_CELL_GROUPING);
        this.modelChanged.emit(this._constructGraphModel());
        setTimeout(() => {
          this._notifyChanges(null);
          this._shrinkCanvasIfTooMuchEmptyVerticalSpace();
        });
      } else if (this.selectedLink) {
        this._enableEntryRepresentingLinkInMatrixDp(this.selectedLink);
        this._deleteLink(this.selectedLink);
        this._notifyChanges(null);
        this.modelChanged.emit(this._constructGraphModel());
      }
    } else if (event.key === 'Escape')
      this._unselectAllSelectedComponents();
  }

  private _deleteSelectedCells() {
    for (const cellToDelete of this.selectedCells) {
      this.columns[cellToDelete.column] = this.columns[cellToDelete.column].filter(cell => cell !== cellToDelete);
      this.linkTable.delete(cellToDelete);
      this.linkTable.forEach(links => {
        for (const link of links)
          if (link.target === cellToDelete) {
            this._deleteLink(link);
            if (link.source.column === 'element')
              this._enableEntryRepresentingLinkInMatrixDp(link);
          }
      });
    }
    this._adjustCellIds(new Set<ColumnId>(this.selectedCells.map(cell => cell.column)));
    this._adjustLinkSelectorsInLinkTable();
  }

  private _adjustCellIds(affectedColumns: Set<ColumnId>) {
    for (const affectedColumn of affectedColumns) {
      const cells = this.columns[affectedColumn];
      for (let index = 0; index < cells.length; index++) {
        const cell = cells[index];
        cell.id = index;
        cell.idSelector = `${cell.column}-cell-${index}`;
      }
    }
  }

  private _adjustLinkSelectorsInLinkTable() {
    this.linkTable.forEach(links => {
      for (const link of links)
        link.idSelector = link.source.idSelector + '_' + link.target.idSelector;
    });
  }

  private _deleteLink(link: Link) {
    const updatedLinks = this.linkTable.get(link.source)
      .filter(e => e !== link);
    if (updatedLinks.length === 0)
      this.linkTable.delete(link.source);
    else
      this.linkTable.set(link.source, updatedLinks);
    this.selectedLink = null;
  }

  private _enableEntryRepresentingLinkInMatrixDp(deletedLink: Link) {
    this._Dp.set([deletedLink.target.id, deletedLink.source.id], 0);
  }

  private _notifyChanges(column?: ColumnId) {
    this.linkTable = new Map<Cell, Link[]>(this.linkTable);
    if (column)
      this.cellGroups[column] = this.cellGroups[column].map(group => group.clone());
    this._changeDetector.detectChanges();
  }

  onLinkSelected(link: Link) {
    this.selectedCells = [];
    this.selectedLink = link;
    this._commandService.select(CommandAction.ACTIVATE_SHOW_ASSOCIATIONS);
  }

  onCellAdded(columnId: ColumnId) {
    const newCell = this._createNewCell(columnId);
    this.columns[columnId] = this.columns[columnId].concat(newCell);
    this._addToDefaultCellGroup(newCell);
    this.modelChanged.emit(this._constructGraphModel());
    this._filePicker.clearSelection();
    // Wait until the new cell was rendered, then start editing the label by dispatching double left click event
    setTimeout(() => {
      this._notifyChanges(columnId);
      newCell.domInstance.querySelector('rect')
        .dispatchEvent(new CustomEvent('dblclick'));
    }, 0);
  }

  private _addToDefaultCellGroup(cell: Cell) {
    const defaultCellGroup = this.cellGroups[cell.column].pop();
    defaultCellGroup.addCell(cell);
    this.cellGroups[cell.column].push(defaultCellGroup);
    // this._changeDetector.detectChanges();
  }

  private _createNewCell(columnId: ColumnId): Cell {
    const id = this.columns[columnId].length;
    return new Cell(id, `${columnId}-cell-${id}`, columnId);
  }

  onElementCellClicked(selectionEvent: CellSelectionEvent) {
    this._addToOrRemoveFromSelectedCells(selectionEvent);
    this._activateCellGroupingOrCellUngroupingCommand();
    this._activateTurnOnCellOrTurnOffCellCommand();
    this.selectedLink = null;
  }

  onPropertyCellClicked(selectionEvent: CellSelectionEvent) {
    // Only "element" column can add links to "element" column
    this._addLinksOrAddToOrRemoveFromSelectedCells('element', selectionEvent);
    this._activateCellGroupingOrCellUngroupingCommand();
  }

  onQualityCellClicked(selectionEvent: CellSelectionEvent) {
    // Only "property" column can add links to "property" column
    this._addLinksOrAddToOrRemoveFromSelectedCells('property', selectionEvent);
    this._activateCellGroupingOrCellUngroupingCommand();
  }

  private _activateCellGroupingOrCellUngroupingCommand() {
    if (this.selectedCells.length > 0) {
      if (this.selectedCells.some(cell => !cell.cellGroup.useDefaultSpacing))
        this._commandService.select(CommandAction.ACTIVATE_CELL_GROUPING);
      else
        this._commandService.select(CommandAction.ACTIVATE_CELL_UNGROUPING);
    } else
      this._commandService.select(CommandAction.ACTIVATE_CELL_GROUPING);
  }

  private _activateTurnOnCellOrTurnOffCellCommand() {
    if (this.selectedCells.some(selected => !selected.isOn))
      this._commandService.select(CommandAction.ACTIVATE_TURN_ON_CELL);
    else
      this._commandService.select(CommandAction.ACTIVATE_TURN_OFF_CELL);
  }

  private _addLinksOrAddToOrRemoveFromSelectedCells(sourceColumn: 'element' | 'property', event: CellSelectionEvent) {
    switch (event.type) {
      case CellSelectionEventType.NEW_SELECTION:
        if (this.selectedCells.length > 0) {
          const addedLinks = this.selectedCells.map(e => e.column === sourceColumn && this._addNewLink(e, event.cell))
            .filter(added => added);
          if (addedLinks.length > 0) {
            this._notifyChanges(null);
            this.modelChanged.emit(this._constructGraphModel());
            this._filePicker.clearSelection();
          } else
            this._addToOrRemoveFromSelectedCells(event);
        } else
          this._addToOrRemoveFromSelectedCells(event);
        break;
      default:
        this._addToOrRemoveFromSelectedCells(event);
        break;
    }
    this.selectedLink = null;
  }

  private _addToOrRemoveFromSelectedCells(selectionEvent: CellSelectionEvent) {
    switch (selectionEvent.type) {
      case CellSelectionEventType.UNSELECT:
        this.selectedCells = this.selectedCells.filter(selectedCell => selectedCell !== selectionEvent.cell);
        break;
      case CellSelectionEventType.NEW_SELECTION:
        this.selectedCells = [selectionEvent.cell];
        break;
      case CellSelectionEventType.SELECT:
        this.selectedCells = this.selectedCells.concat(selectionEvent.cell);
        break;
    }
  }

  private _addNewLink(source: Cell, target: Cell, weight?: number) {
    const newLink = new Link(source, target, source.idSelector + '_' + target.idSelector, weight);

    if (!this.linkTable.has(source)) {
      this.linkTable.set(source, [newLink]);
      return true;
    } else if (!this._linkExists(this.linkTable.get(source), newLink)) {
      this.linkTable.get(source)
        .push(newLink);
      return true;
    }
    return false;
  }

  private _linkExists(links: Link[], newLink: Link) {
    return links.some(e => e.source === newLink.source && e.target === newLink.target);
  }

}
