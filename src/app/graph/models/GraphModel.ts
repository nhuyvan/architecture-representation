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
  links: {
    [selector: string]: LinkGraphModel[];
  };
}

export interface CellGraphModel {
  id: number;
  top: number;
  left: number;
  width: number;
  height: number;
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
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LinkGraphModel {
  sourceColumn: string;
  targetColumn: string;
  source: number;
  target: number;
  idSelector: string;
  weight: number;
}