export interface GraphModelChange {
  type: GraphModelChangeType;
  payload?: any;
}

export enum GraphModelChangeType {
  QUALITY_WEIGHT_UPDATED, CELL_TEXT_UPDATED
}
