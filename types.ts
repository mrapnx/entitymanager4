
export enum AttributeType {
  TEXT = 'text',
  INT = 'int',
  DECIMAL = 'decimal',
  LINK = 'link'
}

export interface Attribute {
  id: string;
  name: string;
  type: AttributeType;
  targetTypeId?: string; // Only for LINK type
}

export interface EntityType {
  id: string;
  name: string;
  attributes: Attribute[];
}

export interface Entity {
  id: string;
  typeId: string;
  values: Record<string, string | number>;
}

export type ViewType = 'cards' | 'table' | 'mindmap' | 'settings';

export interface AppData {
  types: EntityType[];
  entities: Entity[];
}
