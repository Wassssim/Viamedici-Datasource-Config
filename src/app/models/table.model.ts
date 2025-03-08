export interface FilterCondition {
  column: string;
  operator?: '=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'ILIKE' | 'IN';
  value: any;
}

export interface GetRowsOptions {
  filterBy?: FilterCondition[];
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}
