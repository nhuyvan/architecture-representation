import { Cell } from './Cell';
import { LinkGraphModel } from '@shared/graph-model';

export class Link {

  domInstance: SVGGElement = null;

  constructor(public source: Cell, public target: Cell, public idSelector: string, public weight = 1.0) {
  }

  constructLinkGraphModel(): LinkGraphModel {
    return {
      sourceId: this.source.id,
      sourceColumn: this.source.column,
      targetId: this.target.id,
      targetColumn: this.target.column,
      idSelector: this.idSelector,
      weight: this.weight
    };
  }

}
