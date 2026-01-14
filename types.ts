
export enum FieldType {
  CHECKBOX = 'checkbox',
  TEXT = 'text',
  LINK = 'link',
  DATE = 'date',
  MULTI_SELECT = 'multi_select'
}

export interface Field {
  id: string;
  title: string;
  type: FieldType;
  options?: string[]; // For multi-select
  orderIndex: number;
}

export interface CellValue {
  value: string | boolean | string[];
}

export interface Row {
  id: string;
  displayName: string;
  cells: Record<string, CellValue>; // Key is fieldId
  orderIndex: number;
}

export interface Board {
  id: string;
  title: string;
  slug: string;
  isPublic: boolean;
  fields: Field[];
  rows: Row[];
  createdAt: number;
  updatedAt: number;
}

export interface HistoryItem {
  id: string;
  rowId: string;
  fieldId: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}
