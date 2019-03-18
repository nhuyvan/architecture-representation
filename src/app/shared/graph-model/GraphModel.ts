export interface GraphModel {
  attributes: {
    [attributeName: string]: string;
  };
  columns: {
    element: Array<CellGraphModel>;
    property: Array<CellGraphModel>;
    quality: Array<CellGraphModel>;
  };
  groups: {
    element: GroupGraphModel[];
    property: GroupGraphModel[];
    quality: GroupGraphModel[];
  };
  links: Array<LinkGraphModel>;
  angle: string;
  strength: string;
  q: number[];
  version: string;
}

export interface CellGraphModel {
  id: number;
  text: string;
  column: string;
  idSelector: string;
  cellGroup: number;
  isOn: boolean;
  weight: number;
}

export interface GroupGraphModel {
  id: number;
  cells: Array<{ column: string; id: number }>;
  useDefaultSpacing: boolean;
}

export interface LinkGraphModel {
  sourceId: number;
  sourceColumn: string;
  targetId: number;
  targetColumn: string;
  idSelector: string;
  weight: number;
}
